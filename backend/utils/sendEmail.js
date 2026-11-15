import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  // No email settings yet: print the email in the terminal instead
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log("---- EMAIL NOT SENT (no EMAIL_USER / EMAIL_PASS set) ----");
    console.log("To:", to);
    console.log(text);
    console.log("-----------------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Expense Tracker" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};