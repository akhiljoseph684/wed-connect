import "dotenv/config";
import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.example.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM =
  process.env.EMAIL_FROM || "WedConnect <noreply@wedconnect.com>";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

let transporter = null;

console.log("[Email Config]", {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  user: EMAIL_USER,
  hasPassword: Boolean(EMAIL_PASS),
  from: EMAIL_FROM,
});

const getTransporter = () => {
  if (!transporter) {
    if (EMAIL_USER && EMAIL_PASS && EMAIL_HOST !== "smtp.example.com") {
      transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_SECURE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });
    } else {
      // Local development transporter that logs output without failing
      transporter = {
        sendMail: async (options) => {
          console.log(
            `[WedConnect Mock Emailer] To: ${options.to} | Subject: ${options.subject}`,
          );
          return { messageId: `mock-${Date.now()}` };
        },
      };
    }
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = getTransporter();
    const result = await mailer.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });
    return result;
  } catch (err) {
    console.error(
      `[WedConnect Email Error] Could not send email to ${to}:`,
      err.message,
    );
    return null;
  }
};

export const sendPasswordResetEmail = async (
  email,
  resetToken,
  userName = "Valued Member",
) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #722F45; font-size: 28px; margin: 0; font-family: Georgia, serif;">WedConnect</h1>
        <p style="color: #8A7E72; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxury Wedding Ecosystem</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 35px; border-radius: 12px; box-shadow: 0 4px 12px rgba(114, 47, 69, 0.05);">
        <h2 style="color: #2D2426; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;">Hello ${userName},</p>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your WedConnect account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #722F45; color: #FFFFFF; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #8A7E72; font-size: 13px; line-height: 1.5;">This password reset link will expire in 1 hour. If you did not request this, please disregard this email.</p>
      </div>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: "Reset Your WedConnect Password",
    html,
  });
};

export const sendEmailVerificationEmail = async (
  email,
  verificationToken,
  userName = "Valued Member",
) => {
  const verifyUrl = `${CLIENT_URL}/verify-email/${verificationToken}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #722F45; font-size: 28px; margin: 0; font-family: Georgia, serif;">WedConnect</h1>
        <p style="color: #8A7E72; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Luxury Wedding Ecosystem</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 35px; border-radius: 12px; box-shadow: 0 4px 12px rgba(114, 47, 69, 0.05);">
        <h2 style="color: #2D2426; font-size: 20px; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;">Welcome to WedConnect, ${userName}!</p>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;">Please confirm your email address by clicking the button below to activate your luxury wedding planning and creator privileges:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #722F45; color: #FFFFFF; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #8A7E72; font-size: 13px; line-height: 1.5;">This verification link will expire in 24 hours.</p>
      </div>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: "Verify Your WedConnect Email Address",
    html,
  });
};

export const sendCollaborationInviteEmail = async ({
  toEmail,
  planTitle,
  inviterName,
  role,
  inviteUrl,
}) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #722F45; font-size: 28px; margin: 0; font-family: Georgia, serif;">WedConnect</h1>
        <p style="color: #8A7E72; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Wedding Collaboration Invitation</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 35px; border-radius: 12px; box-shadow: 0 4px 12px rgba(114, 47, 69, 0.05);">
        <h2 style="color: #2D2426; font-size: 20px; margin-top: 0;">You're Invited to Plan Together!</h2>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to collaborate on the wedding workspace for <strong>"${planTitle}"</strong> as a <strong>${role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #722F45; color: #FFFFFF; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">View & Respond to Invitation</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail({
    to: toEmail,
    subject: `Wedding Plan Invitation: ${planTitle}`,
    html,
  });
};

export const sendVendorInquiryAlertEmail = async ({
  vendorEmail,
  vendorName,
  clientName,
  clientEmail,
  message,
  weddingDate,
}) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; border-radius: 16px;">
      <div style="background-color: #FFFFFF; padding: 35px; border-radius: 12px;">
        <h2 style="color: #722F45; font-size: 20px; margin-top: 0;">New Inquiry for ${vendorName}</h2>
        <p style="color: #554D4F; font-size: 14px;"><strong>From:</strong> ${clientName} (${clientEmail})</p>
        ${weddingDate ? `<p style="color: #554D4F; font-size: 14px;"><strong>Wedding Date:</strong> ${new Date(weddingDate).toLocaleDateString()}</p>` : ""}
        <div style="background-color: #F8F6F2; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #333;">
          ${message}
        </div>
        <p style="color: #8A7E72; font-size: 12px;">Log into your WedConnect Vendor Dashboard to view and manage this lead.</p>
      </div>
    </div>
  `;
  return sendEmail({
    to: vendorEmail,
    subject: `New Wedding Lead: ${clientName}`,
    html,
  });
};

export const sendAutoInquiryResponseEmail = async ({
  clientEmail,
  clientName,
  vendorName,
  customMessage,
}) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF8F5; border-radius: 16px;">
      <div style="background-color: #FFFFFF; padding: 35px; border-radius: 12px;">
        <h2 style="color: #722F45; font-size: 20px; margin-top: 0;">Message from ${vendorName}</h2>
        <p style="color: #554D4F; font-size: 15px;">Hello ${clientName},</p>
        <p style="color: #554D4F; font-size: 15px; line-height: 1.6;">${customMessage}</p>
        <p style="color: #8A7E72; font-size: 12px; margin-top: 25px;">Sent automatically via WedConnect Vendor Concierge</p>
      </div>
    </div>
  `;
  return sendEmail({
    to: clientEmail,
    subject: `Thank You for Your Inquiry - ${vendorName}`,
    html,
  });
};
