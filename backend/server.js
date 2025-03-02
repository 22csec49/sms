require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup to store files in memory
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

// API to handle file upload and send personalized emails
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let sentEmails = [];
    let invalidEmails = [];

    for (let row of sheetData) {
      const email = row.Mail || row.mail;
      const name = row.Name || "Student";
      delete row.Email;
      delete row.Name;

      if (!email || !isValidEmail(email)) {
        invalidEmails.push(email || "Empty Email");
        continue;
      }

      const subjects = Object.keys(row).map(
        (subject) => `${subject}: ${row[subject]}`
      ).join("\n");
      
      const message = `Hello ${name}'s parents,\n\nWe are pleased to share the recent academic scores of your child:\n\n${subjects}\n\nThank you.`;

      try {
        await transporter.sendMail({
          from: `VCET <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Student Academic Report",
          text: message,
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
