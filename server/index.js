import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  findUserByVerificationToken,
  findUserByResetToken,
  updateUser,
} from "./db.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mailer.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MAX_AVATAR_LENGTH = 2_000_000; // ~1.5MB image as base64

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "3mb" }));

function publicUser(user) {
  const { passwordHash, verificationToken, resetToken, resetTokenExpires, ...safe } = user;
  return safe;
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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`eDiaspora API po dëgjon në http://localhost:${PORT}`);
});
