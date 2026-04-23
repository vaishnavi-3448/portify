import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/portfolio.css";

const API_BASE = "http://127.0.0.1:8000";

const TEMPLATES = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    description: "Minimalist design with focus on content. Best for tech professionals.",
    icon: "✨",
    features: ["Clean layout", "Modern typography", "Dark/Light support"]
  },
  {
    id: "professional-bold",
    name: "Professional Bold",
    description: "Bold and confident design that stands out. Great for creative roles.",
    icon: "💼",
    features: ["Bold accents", "Statement sections", "High contrast"]
  },
  {
    id: "creative-minimal",
    name: "Creative Minimal",
    description: "Elegant and understated. Perfect for designers and artists.",
    icon: "🎨",
    features: ["Whitespace focus", "Elegant fonts", "Subtle animations"]
  }
];

function TemplateSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`${API_BASE}/resume/${id}`);
        setResumeData(res.data);
      } catch (err) {
        console.error("Failed to fetch resume:", err);
        setError("Failed to load resume data. Please try uploading again.");
      }
    };
    fetchResume();
  }, [id]);

  const handleSelectTemplate = async (templateId) => {
    try {
      setLoading(true);
      setError("");
      setSelectedTemplate(templateId);

      await axios.put(`${API_BASE}/resume/${id}/select-template`, {
        template_name: templateId
      });

      setTimeout(() => {
        navigate(`/preview/${id}`);
      }, 500);
    } catch (err) {
      console.error("Failed to select template:", err);
      setError("Failed to select template. Please try again.");
      setLoading(false);
      setSelectedTemplate(null);
    }
  };

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: "center", maxWidth: "700px", padding: "20px" }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Upload Another Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="template-selection-container">
        <div className="template-header">
          <h1>Choose Your Portfolio Template</h1>
          <p>Select a design that best represents your professional identity</p>
        </div>

        <div className="templates-grid">
          {TEMPLATES.map((template, index) => (
            <motion.div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? "selected" : ""}`}
              onClick={() => handleSelectTemplate(template.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              <div className="template-icon">{template.icon}</div>
              <h2 className="template-name">{template.name}</h2>
              <p className="template-description">{template.description}</p>

              <div className="template-features">
                {template.features.map((feature, i) => (
                  <span key={i} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>

              {selectedTemplate === template.id && (
                <div className="template-selection-check">
                  <span>✓ Selected</span>
                </div>
              )}

              {loading && selectedTemplate === template.id && (
                <div className="template-loading">
                  <span className="spinner"></span> Loading...
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="template-footer">
          <p>You can change your template anytime from the preview page</p>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelectionPage;
