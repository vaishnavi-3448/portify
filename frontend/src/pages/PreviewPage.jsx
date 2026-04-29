import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/portfolio.css";

const BASE_URL = "http://98.93.120.138";

function normalizeExperience(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function normalizeEducation(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function normalizeProjects(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function normalizeCertifications(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object");
}

function normalizeSkills(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim());
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [link, setLink] = useState(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  const [visibleProjects, setVisibleProjects] = useState(4);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        setPageError("");

        // ✅ FIXED URL
        const res = await axios.get(`${BASE_URL}/resume/${id}`);
        setResume(res.data);

        if (!res.data.selected_template) {
          navigate(`/templates/${id}`, { replace: true });
        }

      } catch (error) {
        console.error("Preview fetch error:", error);
        setPageError(
          error?.response?.data?.detail || "Failed to load preview page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, navigate]);

  const deploy = async () => {
    try {
      setDeployLoading(true);

      // ✅ FIXED URL
      const res = await axios.put(`${BASE_URL}/resume/${id}/deploy`);

      setLink(`${window.location.origin}/u/${res.data.slug}`);

    } catch (error) {
      console.error("Deploy failed:", error);
      alert(error?.response?.data?.detail || "Deploy failed");
    } finally {
      setDeployLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (pageError) return <div>{pageError}</div>;

  const d = resume?.parsed_data || {};

  return (
    <div>
      <h1>{d.name}</h1>

      <button onClick={deploy}>
        {deployLoading ? "Generating..." : "Generate Public Link"}
      </button>

      {link && (
        <a href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      )}
    </div>
  );
}

export default PreviewPage;