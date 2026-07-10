import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserByVerificationToken, updateUser } from "./db.js";
import { sendVerificationEmail } from "./mailer.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors());
app.use(express.json());

function publicUser(user) {
  const { passwordHash, verificationToken, ...safe } = user;
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

  if (findUserByEmail(email)) {
    return res.status(409).json({
      error: "Email tashmë i regjistruar. Provoni të hyni ose përdorni email tjetër.",
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = createUser({
    name,
    email,
    passwordHash,
    userType,
    company: userType === "business" ? company || "" : "Individual",
    isVerified: false,
    verificationToken,
    createdAt: new Date().toISOString(),
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
});

app.get("/api/verify", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token mungon." });
  }

  const user = findUserByVerificationToken(token);
  if (!user) {
    return res.status(404).json({ error: "Linku i verifikimit është i pavlefshëm ose ka skaduar." });
  }

  if (user.isVerified) {
    return res.json({ message: "Email-i është verifikuar tashmë.", user: publicUser(user) });
  }

  const updated = updateUser(user.id, { isVerified: true });

  return res.json({
    message: "Email-i u verifikua me sukses. Tani mund të kyçesh.",
    user: publicUser(updated),
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Ju lutemi plotësoni email-in dhe fjalëkalimin." });
  }

  const user = findUserByEmail(email);
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
});

app.post("/api/resend-verification", async (req, res) => {
  const { email } = req.body || {};
  const user = email && findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: "Nuk u gjet asnjë llogari me këtë email." });
  }

  if (user.isVerified) {
    return res.json({ message: "Email-i është verifikuar tashmë." });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  updateUser(user.id, { verificationToken });
  const verifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}`;

  try {
    await sendVerificationEmail(user.email, user.name, verifyUrl);
  } catch (err) {
    console.error("Dërgimi i email-it dështoi:", err.message);
    return res.status(502).json({ error: "Dërgimi i email-it dështoi." });
  }

  return res.json({ message: "Email-i i verifikimit u dërgua përsëri." });
});

app.listen(PORT, () => {
  console.log(`eDiaspora API po dëgjon në http://localhost:${PORT}`);
});
