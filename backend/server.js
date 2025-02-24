require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post("/send-messages", async (req, res) => {
  const { students, subjects } = req.body;

  try {
    for (let student of students) {
      let message = `Hello, your child ${student.Student_Name} has received the following grades:\n`;

      subjects.forEach((subject) => {
        message += `${subject}: ${student[subject]}\n`;
      });

      message += `CGPA: ${student.CGPA}`;

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${student.Phone_number}`,
      });
    }
    res.json({ success: true, message: "Messages sent successfully!" });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
