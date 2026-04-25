import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/portfolio.css";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume PDF");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://127.0.0.1:5000/upload", formData);
      navigate(`/templates/${res.data.document_id}`);
    } catch (error) {
      console.error(error);
      setError(error?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload a PDF file");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please upload a PDF file");
        setFile(null);
      }
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h1 className="upload-logo">✨ PORTIFY</h1>
        <p className="upload-subtitle">
          Turn your resume into a polished, deployable portfolio website with a public link.
        </p>

        <div
          className="upload-box"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            borderColor: dragActive ? "var(--accent)" : "var(--border)",
            backgroundColor: dragActive ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.02)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📄</div>
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: "#0f0f0f" }}>
            {dragActive ? "Drop your PDF here" : "Drag & drop your resume here"}
          </p>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            or
          </p>
          <input
            className="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ margin: "12px 0 0" }}
            hidden
            id="file-input"
          />
          <label htmlFor="file-input" style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
            click to browse
          </label>
          {file && (
            <p className="file-name" style={{ marginTop: "12px", color: "var(--accent)", fontWeight: 500 }}>
              ✓ {file.name}
            </p>
          )}
        </div>

        {error && (
          <p style={{ color: "var(--danger)", marginTop: "12px", fontSize: "0.9rem", margin: "12px 0 0" }}>
            ⚠️ {error}
          </p>
        )}

        <div className="upload-actions">
          <button className="primary-btn" onClick={handleUpload} disabled={loading || !file}>
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
                Generating...
              </>
            ) : (
              <>
                <span>🚀</span>
                Generate Portfolio
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default UploadForm;