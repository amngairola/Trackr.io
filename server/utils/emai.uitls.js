import nodemailer from "nodemailer";

export const sendEmail = async (email, otp) => {
  console.log("1");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Account - Tracker.io",
      html: `
             <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Email Verification</h2>
              <p>Your One-Time Password (OTP) for verification is:</p>
              <h1 style="color: #238636; letter-spacing: 5px;">${otp}</h1>
              <p>This code expires in 10 minutes.</p>
            </div>
          `,
    };
    console.log("2");
    await transporter.sendMail(mailOptions);
    console.log("3");
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};
