import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByVerificationToken,
  findUserByResetToken,
  updateUser,
  createPost,
  updatePost,
  listPosts,
  findPostById,
  listPostsByUser,
  setPostFeatured,
  activateFeaturedListing,
  expireFeaturedListings,
  extendSubscription,
  findAdmins,
  renewPost,
  expireOverduePosts,
  deletePost,
  incrementPostClicks,
  createCompletedWork,
  listCompletedWorksByUser,
  createContactMessage,
  listContactMessagesByUser,
  findContactMessageById,
  replyToContactMessage,
  setContactMessageThreadToken,
  findContactMessageByThreadToken,
  addMessageReply,
  listMessageReplies,
  addFavorite,
  removeFavorite,
  listFavoritePostsByUser,
  listFavoritePostIdsByUser,
  createReview,
  listReviewsByUser,
  getReviewSummary,
  createReport,
  listReports,
  setReportStatus,
  listAllUsers,
  listAllPostsForAdmin,
  createOrder,
  findOrderById,
  listOrdersByUser,
  listOrders,
  confirmOrder,
  rejectOrder,
} from "./db.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactMessage,
  sendContactReplyEmail,
  sendThreadStartedEmail,
  sendThreadReplyEmail,
  sendReviewNotificationEmail,
  sendOrderCreatedEmail,
  sendOrderConfirmedEmail,
  isEmail,
} from "./mailer.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const MAX_AVATAR_LENGTH = 2_000_000; // ~1.5MB image as base64
const MAX_PHOTO_LENGTH = 1_000_000; // ~750KB per resized listing/portfolio photo
const MAX_PHOTOS = 5;

// Bank-transfer payment plans. No card gateway yet - orders are confirmed
// manually by an admin after checking the OneFor account.
const BANK_DETAILS = {
  bankName: "OneFor",
  iban: "XK055001000084909646",
  holder: "eDiaspora",
};

const PRICING = {
  featured_listing: { amount: 10, days: 14, label: "Shpallje e promovuar (14 ditë)" },
  subscription: { amount: 15, days: 30, label: "Abonim mujor biznesi" },
  verification: { amount: 10, days: null, label: "Verifikim biznesi" },
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json({ limit: "8mb" }));

function publicUser(user) {
  const { passwordHash, verificationToken, resetToken, resetTokenExpires, ...safe } = user;
  return safe;
}

function publicProfile(user) {
  return {
    id: user.id,
    name: user.name,
    company: user.company,
    userType: user.userType,
    avatarUrl: user.avatarUrl,
    businessVerified: user.businessVerified,
  };
}

async function requireAdmin(email) {
  if (!email) return null;
  const user = await findUserByEmail(email);
  if (!user || !user.isAdmin) return null;
  return user;
}

function validPhotos(photos) {
  if (photos === undefined) return true;
  if (!Array.isArray(photos)) return false;
  if (photos.length > MAX_PHOTOS) return false;
  return photos.every(
    (photo) => typeof photo === "string" && photo.length <= MAX_PHOTO_LENGTH,
  );
}

app.post("/api/register", async (req, res) => {
  const { name, email, password, userType, company } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Ju lutemi plotësoni të gjitha fushat e regjistrimit." });
  }

  if (userType !== "business" && userType !== "individual") {
    return res.status(400).json({ error: "Lloji i llogarisë nuk është valid." });
  }

  try {
    if (await findUserByEmail(email)) {
      return res.status(409).json({
        error: "Email tashmë i regjistruar. Provoni të hyni ose përdorni email tjetër.",
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await createUser({
      name,
      email,
      passwordHash,
      userType,
      company: userType === "business" ? company || "" : "Individual",
      isVerified: false,
      verificationToken,
    });

    const verifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}`;

    try {
      await sendVerificationEmail(email, name, verifyUrl);
    } catch (err) {
      console.error("Dërgimi i email-it dështoi:", err.message);
      return res.status(502).json({
        error: "Regjistrimi u krye, por dërgimi i email-it dështoi. Provoni përsëri më vonë.",
      });
    }

    return res.status(201).json({
      message: "Regjistrimi u krye. Kontrollo email-in tënd për të verifikuar llogarinë.",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Regjistrimi dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token mungon." });
  }

  try {
    const user = await findUserByVerificationToken(token);
    if (!user) {
      return res.status(404).json({ error: "Linku i verifikimit është i pavlefshëm ose ka skaduar." });
    }

    if (user.isVerified) {
      return res.json({ message: "Email-i është verifikuar tashmë.", user: publicUser(user) });
    }

    const updated = await updateUser(user.id, { isVerified: true });

    return res.json({
      message: "Email-i u verifikua me sukses. Tani mund të kyçesh.",
      user: publicUser(updated),
    });
  } catch (err) {
    console.error("Verifikimi dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Ju lutemi plotësoni email-in dhe fjalëkalimin." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: "Email ose fjalëkalimi nuk është i saktë." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Ju lutemi verifikoni email-in përpara se të kyçeni.",
        user: publicUser(user),
      });
    }

    return res.json({ message: "Jeni kyçur me sukses.", user: publicUser(user) });
  } catch (err) {
    console.error("Kyçja dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/resend-verification", async (req, res) => {
  const { email } = req.body || {};

  try {
    const user = email && (await findUserByEmail(email));

    if (!user) {
      return res.status(404).json({ error: "Nuk u gjet asnjë llogari me këtë email." });
    }

    if (user.isVerified) {
      return res.json({ message: "Email-i është verifikuar tashmë." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await updateUser(user.id, { verificationToken });
    const verifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}`;

    await sendVerificationEmail(user.email, user.name, verifyUrl);

    return res.json({ message: "Email-i i verifikimit u dërgua përsëri." });
  } catch (err) {
    console.error("Dërgimi i email-it dështoi:", err.message);
    return res.status(502).json({ error: "Dërgimi i email-it dështoi." });
  }
});

app.put("/api/profile", async (req, res) => {
  const { email, name, phone, address, company, avatarUrl } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  if (avatarUrl && avatarUrl.length > MAX_AVATAR_LENGTH) {
    return res.status(413).json({ error: "Fotoja është shumë e madhe. Provo një më të vogël." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof address === "string") updates.address = address.trim();
    if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl;
    if (user.userType === "business" && typeof company === "string") {
      updates.company = company.trim();
    }

    const updated = await updateUser(user.id, updates);

    return res.json({
      message: "Profili u përditësua me sukses.",
      user: publicUser(updated),
    });
  } catch (err) {
    console.error("Përditësimi i profilit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Ju lutemi vendos email-in tënd." });
  }

  const genericMessage =
    "Nëse ky email ekziston në sistem, do të marrësh një link për të rivendosur fjalëkalimin.";

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await updateUser(user.id, { resetToken, resetTokenExpires });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (err) {
      console.error("Dërgimi i email-it dështoi:", err.message);
    }

    return res.json({ message: genericMessage });
  } catch (err) {
    console.error("Kërkesa për rivendosje dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ error: "Token ose fjalëkalim mungon." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Fjalëkalimi duhet të ketë të paktën 6 shkronja." });
  }

  try {
    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(404).json({ error: "Linku i rivendosjes është i pavlefshëm ose ka skaduar." });
    }

    if (!user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
      return res.status(410).json({ error: "Linku i rivendosjes ka skaduar. Kërko një link të ri." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    await updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    });

    return res.json({ message: "Fjalëkalimi u ndryshua me sukses. Tani mund të kyçesh." });
  } catch (err) {
    console.error("Rivendosja e fjalëkalimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/posts", async (req, res) => {
  const { category, city, minPrice, maxPrice, search } = req.query;

  try {
    const posts = await listPosts({
      category: category || undefined,
      city: city || undefined,
      search: search || undefined,
      minPrice: minPrice !== undefined && minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : undefined,
    });
    return res.json({ posts });
  } catch (err) {
    console.error("Marrja e postimeve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/posts/:id/click", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }

  try {
    const post = await incrementPostClicks(id);
    if (!post) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }
    return res.json({ post });
  } catch (err) {
    console.error("Regjistrimi i klikimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/posts", async (req, res) => {
  const { email, title, category, subcategory, type, description, price, photos, city, country } =
    req.body || {};

  if (!email || !title || !category || !subcategory || !type || !description || !price) {
    return res.status(400).json({ error: "Ju lutemi plotësoni të gjitha fushat e postimit." });
  }

  if (!validPhotos(photos)) {
    return res.status(413).json({ error: "Fotot janë ose shumë të mëdha ose shumë të shumta." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Ju lutemi verifikoni email-in para se të publikoni." });
    }

    const post = await createPost({
      userId: user.id,
      title,
      category,
      subcategory,
      type,
      description,
      price,
      photos: photos || [],
      city,
      country,
    });

    return res.status(201).json({
      message: "Postimi u regjistrua me sukses.",
      post: { ...post, author: user.name, userType: user.userType },
    });
  } catch (err) {
    console.error("Postimi dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { email, title, category, subcategory, type, description, price, photos, city, country } =
    req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }

  if (!email || !title || !category || !subcategory || !type || !description || !price) {
    return res.status(400).json({ error: "Ju lutemi plotësoni të gjitha fushat e postimit." });
  }

  if (!validPhotos(photos)) {
    return res.status(413).json({ error: "Fotot janë ose shumë të mëdha ose shumë të shumta." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const post = await updatePost(id, user.id, {
      title,
      category,
      subcategory,
      type,
      description,
      price,
      photos: photos || [],
      city,
      country,
    });

    if (!post) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }

    return res.json({
      message: "Postimi u përditësua me sukses.",
      post: { ...post, author: user.name, userType: user.userType },
    });
  } catch (err) {
    console.error("Përditësimi i postimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/posts/:id/renew", async (req, res) => {
  const id = Number(req.params.id);
  const { email } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }
  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const post = await renewPost(id, user.id);
    if (!post) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }

    return res.json({ message: "Shpallja u rinovua për 60 ditë të tjera.", post });
  } catch (err) {
    console.error("Rinovimi i postimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { email } = req.query;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const post = await findPostById(id);
    if (!post || post.userId !== user.id) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }

    await deletePost(id);
    return res.json({ message: "Postimi u fshi." });
  } catch (err) {
    console.error("Fshirja e postimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/posts/:id/report", async (req, res) => {
  const id = Number(req.params.id);
  const { reporterName, reason } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "Ju lutemi shkruani arsyen e raportimit." });
  }
  if (reason.length > 1000) {
    return res.status(400).json({ error: "Arsyeja është shumë e gjatë." });
  }

  try {
    const post = await findPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }

    const report = await createReport({ postId: id, reporterName, reason });
    return res.status(201).json({ message: "Faleminderit, raportimi u dërgua te ekipi ynë.", report });
  } catch (err) {
    console.error("Raportimi dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/users/:id/reviews", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }

  try {
    const [reviews, summary] = await Promise.all([
      listReviewsByUser(id),
      getReviewSummary(id),
    ]);
    return res.json({ reviews, summary });
  } catch (err) {
    console.error("Marrja e vlerësimeve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/users/:id/reviews", async (req, res) => {
  const id = Number(req.params.id);
  const { reviewerName, rating, comment } = req.body || {};
  const numericRating = Number(rating);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }
  if (!reviewerName || !reviewerName.trim()) {
    return res.status(400).json({ error: "Ju lutemi shkruani emrin tuaj." });
  }
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Vlerësimi duhet të jetë nga 1 deri në 5." });
  }
  if (comment && comment.length > 2000) {
    return res.status(400).json({ error: "Komenti është shumë i gjatë." });
  }

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const review = await createReview({
      targetUserId: id,
      reviewerName: reviewerName.trim(),
      rating: numericRating,
      comment: comment ? comment.trim() : null,
    });

    try {
      await sendReviewNotificationEmail(user.email, user.name, reviewerName, numericRating, comment);
    } catch (err) {
      console.error("Dërgimi i njoftimit të vlerësimit dështoi:", err.message);
    }

    return res.status(201).json({ message: "Faleminderit për vlerësimin.", review });
  } catch (err) {
    console.error("Shtimi i vlerësimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/users/:id/public", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    return res.json({ user: publicProfile(user) });
  } catch (err) {
    console.error("Marrja e profilit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/users/:id/contact", async (req, res) => {
  const id = Number(req.params.id);
  const { name, contact, message } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }

  if (!name || !contact || !message) {
    return res
      .status(400)
      .json({ error: "Ju lutemi plotësoni emrin, kontaktin dhe mesazhin." });
  }

  if (name.length > 200 || contact.length > 200 || message.length > 4000) {
    return res.status(400).json({ error: "Mesazhi është shumë i gjatë." });
  }

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const saved = await createContactMessage({
      recipientUserId: user.id,
      senderName: name,
      senderContact: contact,
      message,
    });

    const threadToken = crypto.randomBytes(24).toString("hex");
    await setContactMessageThreadToken(saved.id, threadToken);

    try {
      await sendContactMessage(user.email, user.name, name, contact, message);
    } catch (err) {
      console.error("Dërgimi i email-it të kontaktit dështoi:", err.message);
    }

    if (isEmail(contact)) {
      try {
        const threadUrl = `${FRONTEND_URL}/biseda/${threadToken}`;
        await sendThreadStartedEmail(contact, name, threadUrl);
      } catch (err) {
        console.error("Dërgimi i email-it të bisedës dështoi:", err.message);
      }
    }

    return res.status(201).json({
      message: "Mesazhi u dërgua me sukses.",
      contactMessage: { ...saved, threadToken },
    });
  } catch (err) {
    console.error("Ruajtja e mesazhit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/threads/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const thread = await findContactMessageByThreadToken(token);
    if (!thread) {
      return res.status(404).json({ error: "Biseda nuk u gjet." });
    }

    const [replies, recipient] = await Promise.all([
      listMessageReplies(thread.id),
      findUserById(thread.recipientUserId),
    ]);

    return res.json({
      thread: { ...thread, recipientName: recipient ? recipient.name : null },
      replies,
    });
  } catch (err) {
    console.error("Marrja e bisedës dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/threads/:token/reply", async (req, res) => {
  const { token } = req.params;
  const { body } = req.body || {};

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Shkruaj një përgjigje para se ta dërgosh." });
  }
  if (body.length > 4000) {
    return res.status(400).json({ error: "Mesazhi është shumë i gjatë." });
  }

  try {
    const thread = await findContactMessageByThreadToken(token);
    if (!thread) {
      return res.status(404).json({ error: "Biseda nuk u gjet." });
    }

    const reply = await addMessageReply({
      contactMessageId: thread.id,
      sender: "sender",
      body: body.trim(),
    });

    const recipient = await findUserById(thread.recipientUserId);
    if (recipient) {
      try {
        const threadUrl = `${FRONTEND_URL}/panel`;
        await sendThreadReplyEmail(recipient.email, recipient.name, thread.senderName, body, threadUrl);
      } catch (err) {
        console.error("Dërgimi i njoftimit dështoi:", err.message);
      }
    }

    return res.status(201).json({ message: "Mesazhi u dërgua.", reply });
  } catch (err) {
    console.error("Dërgimi i mesazhit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/messages", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const messages = await listContactMessagesByUser(user.id);
    return res.json({ messages });
  } catch (err) {
    console.error("Marrja e mesazheve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/messages/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { email } = req.query;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e mesazhit nuk është valide." });
  }

  try {
    const existing = await findContactMessageById(id);
    if (!existing) {
      return res.status(404).json({ error: "Mesazhi nuk u gjet." });
    }

    const user = await findUserByEmail(email);
    if (!user || user.id !== existing.recipientUserId) {
      return res.status(403).json({ error: "Nuk keni qasje në këtë mesazh." });
    }

    const replies = await listMessageReplies(id);
    return res.json({ contactMessage: existing, replies });
  } catch (err) {
    console.error("Marrja e mesazhit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/messages/:id/reply", async (req, res) => {
  const id = Number(req.params.id);
  const { email, reply } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e mesazhit nuk është valide." });
  }

  if (!email || !reply) {
    return res.status(400).json({ error: "Ju lutemi shkruani përgjigjen." });
  }

  if (reply.length > 4000) {
    return res.status(400).json({ error: "Përgjigja është shumë e gjatë." });
  }

  try {
    const existing = await findContactMessageById(id);
    if (!existing) {
      return res.status(404).json({ error: "Mesazhi nuk u gjet." });
    }

    const user = await findUserByEmail(email);
    if (!user || user.id !== existing.recipientUserId) {
      return res.status(403).json({ error: "Nuk keni qasje në këtë mesazh." });
    }

    const updated = await replyToContactMessage(id, reply);
    const replyRecord = await addMessageReply({
      contactMessageId: id,
      sender: "recipient",
      body: reply,
    });

    if (isEmail(existing.senderContact)) {
      try {
        const threadUrl = existing.threadToken
          ? `${FRONTEND_URL}/biseda/${existing.threadToken}`
          : undefined;
        if (threadUrl) {
          await sendThreadReplyEmail(existing.senderContact, existing.senderName, user.name, reply, threadUrl);
        } else {
          await sendContactReplyEmail(
            existing.senderContact,
            existing.senderName,
            user.name,
            reply,
            existing.message,
          );
        }
      } catch (err) {
        console.error("Dërgimi i përgjigjes me email dështoi:", err.message);
      }
    }

    return res.json({
      message: "Përgjigja u dërgua me sukses.",
      contactMessage: updated,
      reply: replyRecord,
    });
  } catch (err) {
    console.error("Dërgimi i përgjigjes dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/completed-works", async (req, res) => {
  const userId = Number(req.query.userId);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }

  try {
    const works = await listCompletedWorksByUser(userId);
    return res.json({ works });
  } catch (err) {
    console.error("Marrja e punëve të kryera dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/completed-works", async (req, res) => {
  const { email, description, photos } = req.body || {};

  if (!email || !description || !Array.isArray(photos) || photos.length === 0) {
    return res
      .status(400)
      .json({ error: "Shtoni të paktën një foto dhe përshkrimin e punës." });
  }

  if (!validPhotos(photos)) {
    return res.status(413).json({ error: "Fotot janë ose shumë të mëdha ose shumë të shumta." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Ju lutemi verifikoni email-in para se të publikoni." });
    }

    const work = await createCompletedWork({
      userId: user.id,
      description,
      photos,
    });

    return res.status(201).json({ message: "Puna e kryer u shtua me sukses.", work });
  } catch (err) {
    console.error("Shtimi i punës dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/favorites", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const posts = await listFavoritePostsByUser(user.id);
    return res.json({ posts });
  } catch (err) {
    console.error("Marrja e të preferuarave dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/favorites", async (req, res) => {
  const { email, postId } = req.body || {};
  const id = Number(postId);

  if (!email || !Number.isInteger(id)) {
    return res.status(400).json({ error: "Kërkesë e pavlefshme." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    await addFavorite(user.id, id);
    const postIds = await listFavoritePostIdsByUser(user.id);
    return res.status(201).json({ message: "U shtua te të preferuarat.", postIds });
  } catch (err) {
    console.error("Shtimi te të preferuarat dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.delete("/api/favorites/:postId", async (req, res) => {
  const postId = Number(req.params.postId);
  const { email } = req.query;

  if (!email || !Number.isInteger(postId)) {
    return res.status(400).json({ error: "Kërkesë e pavlefshme." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    await removeFavorite(user.id, postId);
    const postIds = await listFavoritePostIdsByUser(user.id);
    return res.json({ message: "U hoq nga të preferuarat.", postIds });
  } catch (err) {
    console.error("Heqja nga të preferuarat dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/dashboard/stats", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const [posts, messages, reviewSummary] = await Promise.all([
      listPostsByUser(user.id),
      listContactMessagesByUser(user.id),
      getReviewSummary(user.id),
    ]);

    const totalClicks = posts.reduce((sum, post) => sum + (post.clicks || 0), 0);

    return res.json({
      stats: {
        postCount: posts.length,
        totalClicks,
        messageCount: messages.length,
        reviewCount: reviewSummary.count,
        averageRating: reviewSummary.average,
      },
      posts,
    });
  } catch (err) {
    console.error("Marrja e statistikave dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/pricing", (req, res) => {
  res.json({ pricing: PRICING, bankDetails: BANK_DETAILS });
});

app.get("/api/orders", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Mungon email-i i llogarisë." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    const orders = await listOrdersByUser(user.id);
    return res.json({ orders });
  } catch (err) {
    console.error("Marrja e porosive dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.post("/api/orders", async (req, res) => {
  const { email, type, postId } = req.body || {};

  if (!email || !PRICING[type]) {
    return res.status(400).json({ error: "Kërkesë e pavlefshme." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }

    if ((type === "subscription" || type === "verification") && user.userType !== "business") {
      return res.status(403).json({ error: "Vetëm llogaritë e biznesit mund të blejnë këtë plan." });
    }

    let resolvedPostId = null;
    if (type === "featured_listing") {
      const id = Number(postId);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Zgjidh një shpallje për ta promovuar." });
      }
      const post = await findPostById(id);
      if (!post || post.userId !== user.id) {
        return res.status(404).json({ error: "Shpallja nuk u gjet." });
      }
      resolvedPostId = id;
    }

    const plan = PRICING[type];
    const referenceCode = `ED-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const order = await createOrder({
      userId: user.id,
      type,
      postId: resolvedPostId,
      amount: plan.amount,
      referenceCode,
    });

    try {
      const admins = await findAdmins();
      await Promise.all(
        admins.map((admin) =>
          sendOrderCreatedEmail(admin.email, user.name, plan.label, plan.amount, referenceCode),
        ),
      );
    } catch (err) {
      console.error("Njoftimi i adminëve dështoi:", err.message);
    }

    return res.status(201).json({
      message: "Porosia u krijua. Ndiqni udhëzimet për transfertën bankare.",
      order,
      bankDetails: BANK_DETAILS,
    });
  } catch (err) {
    console.error("Krijimi i porosisë dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

// --- Admin ---

app.get("/api/admin/orders", async (req, res) => {
  const admin = await requireAdmin(req.query.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  try {
    const orders = await listOrders({ status: req.query.status || undefined });
    return res.json({ orders });
  } catch (err) {
    console.error("Marrja e porosive dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/admin/orders/:id/confirm", async (req, res) => {
  const admin = await requireAdmin(req.body?.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e porosisë nuk është valide." });
  }

  try {
    const existing = await findOrderById(id);
    if (!existing) {
      return res.status(404).json({ error: "Porosia nuk u gjet." });
    }
    if (existing.status !== "pending") {
      return res.status(409).json({ error: "Kjo porosi është trajtuar tashmë." });
    }

    const plan = PRICING[existing.type];
    const buyer = await findUserById(existing.userId);

    if (existing.type === "featured_listing" && existing.postId) {
      await activateFeaturedListing(existing.postId, plan.days);
    } else if (existing.type === "subscription") {
      await extendSubscription(existing.userId, plan.days);
      await updateUser(existing.userId, { businessVerified: true });
    } else if (existing.type === "verification") {
      await updateUser(existing.userId, { businessVerified: true });
    }

    const order = await confirmOrder(id);

    if (buyer) {
      try {
        await sendOrderConfirmedEmail(buyer.email, buyer.name, plan.label);
      } catch (err) {
        console.error("Dërgimi i email-it të konfirmimit dështoi:", err.message);
      }
    }

    return res.json({ message: "Porosia u konfirmua dhe plani u aktivizua.", order });
  } catch (err) {
    console.error("Konfirmimi i porosisë dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/admin/orders/:id/reject", async (req, res) => {
  const admin = await requireAdmin(req.body?.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  const { reason } = req.body || {};
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e porosisë nuk është valide." });
  }

  try {
    const order = await rejectOrder(id, reason);
    if (!order) {
      return res.status(404).json({ error: "Porosia nuk u gjet ose është trajtuar tashmë." });
    }
    return res.json({ message: "Porosia u refuzua.", order });
  } catch (err) {
    console.error("Refuzimi i porosisë dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/admin/users", async (req, res) => {
  const admin = await requireAdmin(req.query.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  try {
    const users = await listAllUsers();
    return res.json({ users: users.map(publicUser) });
  } catch (err) {
    console.error("Marrja e përdoruesve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/admin/users/:id/verify-business", async (req, res) => {
  const admin = await requireAdmin(req.body?.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  const { businessVerified } = req.body || {};
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e llogarisë nuk është valide." });
  }

  try {
    const updated = await updateUser(id, { businessVerified: Boolean(businessVerified) });
    if (!updated) {
      return res.status(404).json({ error: "Llogaria nuk u gjet." });
    }
    return res.json({ message: "U përditësua statusi i verifikimit.", user: publicUser(updated) });
  } catch (err) {
    console.error("Përditësimi i verifikimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/admin/posts", async (req, res) => {
  const admin = await requireAdmin(req.query.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  try {
    const posts = await listAllPostsForAdmin();
    return res.json({ posts });
  } catch (err) {
    console.error("Marrja e postimeve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/admin/posts/:id/feature", async (req, res) => {
  const admin = await requireAdmin(req.body?.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  const { featured } = req.body || {};
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }

  try {
    const post = await setPostFeatured(id, Boolean(featured));
    if (!post) {
      return res.status(404).json({ error: "Postimi nuk u gjet." });
    }
    return res.json({ message: "U përditësua statusi i promovimit.", post });
  } catch (err) {
    console.error("Përditësimi i promovimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.delete("/api/admin/posts/:id", async (req, res) => {
  const admin = await requireAdmin(req.query.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID e postimit nuk është valide." });
  }

  try {
    await deletePost(id);
    return res.json({ message: "Postimi u fshi." });
  } catch (err) {
    console.error("Fshirja e postimit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/admin/reports", async (req, res) => {
  const admin = await requireAdmin(req.query.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  try {
    const reports = await listReports({ status: req.query.status || undefined });
    return res.json({ reports });
  } catch (err) {
    console.error("Marrja e raporteve dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.put("/api/admin/reports/:id", async (req, res) => {
  const admin = await requireAdmin(req.body?.email);
  if (!admin) {
    return res.status(403).json({ error: "Nuk keni qasje admin." });
  }

  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!Number.isInteger(id) || !["pending", "resolved", "dismissed"].includes(status)) {
    return res.status(400).json({ error: "Kërkesë e pavlefshme." });
  }

  try {
    const report = await setReportStatus(id, status);
    if (!report) {
      return res.status(404).json({ error: "Raporti nuk u gjet." });
    }
    return res.json({ message: "Statusi i raportit u përditësua.", report });
  } catch (err) {
    console.error("Përditësimi i raportit dështoi:", err.message);
    return res.status(500).json({ error: "Diçka shkoi keq. Provoni përsëri." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

function runExpiryJobs() {
  expireOverduePosts().catch((err) =>
    console.error("Skadimi automatik i shpalljeve dështoi:", err.message),
  );
  expireFeaturedListings().catch((err) =>
    console.error("Skadimi automatik i promovimeve dështoi:", err.message),
  );
}

runExpiryJobs();
setInterval(runExpiryJobs, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`eDiaspora API po dëgjon në http://localhost:${PORT}`);
});
