import { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      setDocId(res.data.document_id);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upload Resume</h2>

      <input type="file" onChange={handleFileChange} />
      <br /><br />

      <button onClick={handleUpload}>Upload</button>

      {docId && (
        <div>
          <h3>Resume Stored Successfully</h3>
          <p>ID: {docId}</p>

          <a href={`/portfolio/${docId}`}>
            <button>View Portfolio</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadForm;