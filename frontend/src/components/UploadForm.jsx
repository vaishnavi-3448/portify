import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UploadForm() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      navigate(`/templates/${res.data.document_id}`);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Resume to Portfolio Generator</h1>
      <h2>Upload Resume</h2>

      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <br /><br />

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default UploadForm;