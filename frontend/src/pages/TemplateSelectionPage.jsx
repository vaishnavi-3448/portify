import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function TemplateSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const templates = [
    {
      key: "minimal-professional",
      name: "Minimal Professional",
      description: "Clean and simple layout for professional roles."
    },
    {
      key: "modern-developer",
      name: "Modern Developer",
      description: "Best for tech portfolios with strong project focus."
    },
    {
      key: "creative-dark",
      name: "Creative Dark",
      description: "Bold dark theme for a stylish modern look."
    }
  ];

  const handleTemplateSelect = async (templateKey) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/resume/${id}/select-template`,
        { template: templateKey }
      );

      navigate(`/preview/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to select template");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Select a Portfolio Template</h1>
      <p>Choose one template to generate your website preview.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "30px"
        }}
      >
        {templates.map((template) => (
          <div
            key={template.key}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            <h2>{template.name}</h2>
            <p>{template.description}</p>
            <button onClick={() => handleTemplateSelect(template.key)}>
              Create Website
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelectionPage;