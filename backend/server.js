require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Multer setup to store files in memory (not in disk)
const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// API to handle file upload and send emails
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let sentEmails = [];
    let invalidEmails = [];

    for (let row of sheetData) {
      const email = row.Mail|| row.mail;

      if (!email || !isValidEmail(email)) {
        invalidEmails.push(email || "Empty Email");
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"Your Name" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Test Email",
          text: "This is a test email sent from Node.js",
        });
        sentEmails.push(email);
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
        invalidEmails.push(email);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Emails processed",
      sentEmails,
      invalidEmails,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
