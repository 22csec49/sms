import React, { useState } from "react";
import axios from "axios";


const App = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { sentEmails, invalidEmails } = response.data;

      if (invalidEmails.length > 0) {
        setMessage(`Emails sent: ${sentEmails.length}, Invalid emails: ${invalidEmails.join(", ")}`);
      } else {
        setMessage(`Successfully sent emails to ${sentEmails.length} recipients.`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to send emails.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Email Sender</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload} style={styles.button}>Send Emails</button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "red",
  },
};

export default App;
