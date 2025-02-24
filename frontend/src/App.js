import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const App = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length > 0) {
        const keys = Object.keys(jsonData[0]); // Extract column names
        const filteredSubjects = keys.filter(
          (key) => !["Student_Name", "reg_no", "Phone_number", "CGPA"].includes(key)
        );

        setSubjects(filteredSubjects);
        setStudents(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const sendMessages = async () => {
    try {
      await axios.post("http://localhost:5000/send-messages", { students, subjects });
      alert("Messages sent successfully!");
    } catch (error) {
      console.error("Error sending messages:", error);
      alert("Failed to send messages.");
    }
  };

  return (
    <div className="container" style={{ textAlign: "center", padding: "20px" }}>
      <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY - SEM AUTOMATIC MESSAGER</h1>

      <label style={{ padding: "10px 20px", background: "blue", color: "white", cursor: "pointer", borderRadius: "5px", marginBottom: "10px" }}>
        Upload Excel File
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: "none" }} />
      </label>

      {students.length > 0 && (
        <>
          <table border="1" cellPadding="5" style={{ width: "80%", margin: "20px auto" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>Phone</th>
                {subjects.map((subject, index) => (
                  <th key={index}>{subject}</th>
                ))}
                <th>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.Student_Name}</td>
                  <td>{student.reg_no}</td>
                  <td>{student.Phone_number}</td>
                  {subjects.map((subject, idx) => (
                    <td key={idx}>{student[subject]}</td>
                  ))}
                  <td>{student.CGPA}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={sendMessages} style={{ padding: "10px 20px", background: "blue", color: "white", border: "none", cursor: "pointer" }}>
            Send Messages
          </button>
        </>
      )}
    </div>
  );
};

export default App;