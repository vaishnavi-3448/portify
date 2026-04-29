import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/portfolio.css";
import API_BASE from "../config";

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

      const res = await axios.post(
  `${API_BASE}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);

      // SAFE ID extraction (prevents crash)
      const documentId =
        res.data?.document_id ||
        res.data?.id ||
        res.data?.doc_id ||
        null;

      if (!documentId) {
        console.error("No document_id found in response");
        setError("Upload succeeded but no document ID returned from backend.");
        return;
      }

      navigate(`/templates/${documentId}`);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      setError(
        error?.response?.data?.detail ||
        error?.message ||
        "Upload failed. Please try again."
      );
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
            backgroundColor: dragActive
              ? "rgba(37, 99, 235, 0.1)"
              : "rgba(37, 99, 235, 0.02)",
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
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            hidden
            id="file-input"
          />

          <label
            htmlFor="file-input"
            style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
          >
            click to browse
          </label>

          {file && (
            <p
              style={{
                marginTop: "12px",
                color: "var(--accent)",
                fontWeight: 500,
              }}
            >
              ✓ {file.name}
            </p>
          )}
        </div>

        {error && (
          <p
            style={{
              color: "var(--danger)",
              marginTop: "12px",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <div className="upload-actions">
          <button
            className="primary-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
                  ⚙️
                </span>
                Generating...
              </>
            ) : (
              <>
                🚀 Generate Portfolio
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
