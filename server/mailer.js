import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendVerificationEmail(to, name, verifyUrl) {
  if (!resend) {
    console.log(
      `[dev] RESEND_API_KEY nuk është vendosur. Linku i verifikimit për ${to}:\n${verifyUrl}`,
    );
    return { simulated: true };
  }

  const from = process.env.EMAIL_FROM || "eDiaspora <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Verifiko email-in tënd - eDiaspora",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Përshëndetje ${name},</h2>
        <p style="color:#4b5563;">
          Faleminderit që u regjistrove në eDiaspora. Kliko butonin më poshtë
          për të verifikuar email-in tënd dhe për të aktivizuar llogarinë.
        </p>
        <p style="text-align:center; margin: 2rem 0;">
          <a href="${verifyUrl}"
             style="background:#111; color:#fff; padding:0.9rem 1.5rem; border-radius:999px; text-decoration:none; font-weight:600;">
            Verifiko email-in
          </a>
        </p>
        <p style="color:#9ca3af; font-size:0.85rem;">
          Nëse butoni nuk funksionon, kopjo këtë link në shfletues:<br />
          ${verifyUrl}
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Dërgimi i email-it dështoi.");
  }

  return data;
}

export async function sendPasswordResetEmail(to, name, resetUrl) {
  if (!resend) {
    console.log(
      `[dev] RESEND_API_KEY nuk është vendosur. Linku i rivendosjes për ${to}:\n${resetUrl}`,
    );
    return { simulated: true };
  }

  const from = process.env.EMAIL_FROM || "eDiaspora <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Rivendos fjalëkalimin - eDiaspora",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Përshëndetje ${name},</h2>
        <p style="color:#4b5563;">
          Kemi marrë një kërkesë për të rivendosur fjalëkalimin e llogarisë
          tënde. Kliko butonin më poshtë për të vendosur një fjalëkalim të ri.
          Nëse s'e ke kërkuar ti këtë, shpërfille këtë email.
        </p>
        <p style="text-align:center; margin: 2rem 0;">
          <a href="${resetUrl}"
             style="background:#111; color:#fff; padding:0.9rem 1.5rem; border-radius:999px; text-decoration:none; font-weight:600;">
            Rivendos fjalëkalimin
          </a>
        </p>
        <p style="color:#9ca3af; font-size:0.85rem;">
          Ky link skadon brenda 1 ore. Nëse butoni nuk funksionon, kopjo këtë
          link në shfletues:<br />
          ${resetUrl}
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Dërgimi i email-it dështoi.");
  }

  return data;
}
