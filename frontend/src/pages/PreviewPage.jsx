import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/portfolio.css";

const API_BASE = "http://127.0.0.1:5000";

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
        const res = await axios.get(`${API_BASE}/resume/${id}`);
        setResume(res.data);

        // If no template selected, redirect to template selection
        if (!res.data.selected_template) {
          navigate(`/templates/${id}`, { replace: true });
          return;
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
      const res = await axios.put(`${API_BASE}/resume/${id}/deploy`);
      setLink(`http://localhost:5173/u/${res.data.slug}`);
    } catch (error) {
      console.error("Deploy failed:", error);
      alert(error?.response?.data?.detail || "Deploy failed");
    } finally {
      setDeployLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading portfolio preview...</div>;
  }

  if (pageError) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: "center", maxWidth: "700px", padding: "20px" }}>
          <h2>Preview could not be loaded</h2>
          <p>{pageError}</p>
          <p style={{ marginTop: "12px", color: "#666" }}>
            Restart backend, upload the resume again, and test with the new preview link.
          </p>
        </div>
      </div>
    );
  }

  if (!resume || !resume.parsed_data || Object.keys(resume.parsed_data).length === 0) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: "center", maxWidth: "700px", padding: "20px" }}>
          <h2>No data available</h2>
          <p>The resume could not be parsed or no data was extracted. Please check the resume format and try uploading again.</p>
          <p style={{ marginTop: "12px", color: "#666" }}>
            Ensure the PDF contains text (not images) and standard sections like Experience, Education, etc.
          </p>
        </div>
      </div>
    );
  }

  const d = resume?.parsed_data || {};

  const name = safeText(d.name, "Your Name");
  const email = safeText(d.email, "yourmail@example.com");
  const phone = safeText(d.phone, "Not available");
  const summary = safeText(
    d.summary,
    "This portfolio preview is generated from the uploaded resume and organized into a cleaner professional presentation."
  );

  const experience = normalizeExperience(d.experience);
  const education = normalizeEducation(d.education);
  const projects = normalizeProjects(d.projects);
  const skills = normalizeSkills(d.skills);
  const certifications = normalizeCertifications(d.certifications);

  const heroTitle =
    skills.length >= 3
      ? `${skills[0]} • ${skills[1]} • ${skills[2]}`
      : skills.length > 0
      ? skills.join(" • ")
      : "Portfolio generated from resume data";

  const projectCategories = ["All", "Technical", "Academic", "Featured"];

  const projectObjects = projects.map((project, index) => ({
    title: safeText(project.title, "Untitled Project"),
    description: safeText(
      project.description,
      "No description available for this project yet."
    ),
    category:
      safeText(project.category) ||
      (index % 3 === 0 ? "Technical" : index % 3 === 1 ? "Academic" : "Featured"),
    link: safeText(project.link),
    details: Array.isArray(project.details) ? project.details : [],
  }));

  const filteredProjects =
    projectFilter === "All"
      ? projectObjects
      : projectObjects.filter((p) => p.category === projectFilter);

  const shownProjects = filteredProjects.slice(0, visibleProjects);

  return (
    <div className="portfolio-page">
      <header className="portfolio-navbar">
        <div className="portfolio-brand">
          <a href="#home">{name}</a>
        </div>

        <nav className="portfolio-nav-links">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#education">Education</a>
          <a href="#certifications">Certifications</a>
          <a href="#projects">Projects</a>
          <button className="contact-link-btn" onClick={() => setShowContact(true)} type="button">
            Contact
          </button>
        </nav>
      </header>

      <main className="portfolio-main">
        <section id="home" className="hero-section">
          <div className="hero-left">
            <p className="hero-kicker">Portfolio Preview</p>
            <h1 className="hero-name">{name}</h1>
            <p className="hero-tagline">{heroTitle}</p>

            <div className="hero-actions">
              <a href="#projects" className="primary-btn">View Projects</a>
              <button type="button" className="secondary-btn" onClick={() => setShowContact(true)}>
                Contact
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="portrait-card">
              <div className="portrait-circle">{name.charAt(0).toUpperCase()}</div>
              <p className="portrait-caption">AI-generated preview</p>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div>
            <section id="about" className="content-section">
              <div className="section-shell terminal-shell">
                <div className="terminal-heading">about.sh</div>
                <div className="terminal-content">
                  <p>{summary}</p>
                  {skills.length > 0 && (
                    <div className="pill-wrap">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section id="work" className="content-section">
              <h2 className="section-title">Work Experience</h2>
              {experience.length > 0 ? (
                <div className="work-section-timeline">
                  {experience.map((item, idx) => (
                    <div key={idx} className="work-entry">
                      <div className="work-entry-header">
                        <div className="work-entry-left">
                          <h3>{safeText(item.company, "Company")}</h3>
                          <p className="work-entry-role">{safeText(item.role || item.title, "Position")}</p>
                          {safeText(item.location) && (
                            <p className="work-entry-location">{item.location}</p>
                          )}
                        </div>
                        <div className="work-entry-right">
                          {safeText(item.duration) && <p className="work-entry-year">{item.duration}</p>}
                        </div>
                      </div>
                      {safeText(item.description) && (
                        <p className="work-entry-description">{item.description}</p>
                      )}
                      {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                        <ul className="work-entry-bullets">
                          {item.bullets.map((bullet, bulletIdx) => (
                            <li key={bulletIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-card">No work experience found.</div>
              )}
            </section>

            <section id="education" className="content-section">
              <h2 className="section-title">Education</h2>
              {education.length > 0 ? (
                <div className="edu-section-timeline">
                  {education.map((item, idx) => (
                    <div key={idx} className="edu-entry">
                      <div className="edu-entry-header">
                        <div className="edu-entry-left">
                          <h3>{safeText(item.institution, "Educational Institution")}</h3>
                          <p className="edu-entry-degree">{safeText(item.degree || item.program, "Degree/Program")}</p>
                          {safeText(item.location) && (
                            <p className="edu-entry-location">{item.location}</p>
                          )}
                        </div>
                        <div className="edu-entry-right">
                          {safeText(item.duration) && <p className="edu-entry-year">{item.duration}</p>}
                        </div>
                      </div>
                      {Array.isArray(item.details) && item.details.length > 0 && (
                        <ul className="edu-entry-details">
                          {item.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-card">No education entries found.</div>
              )}
            </section>

            <section id="certifications" className="content-section">
              <h2 className="section-title">Certifications</h2>
              {certifications.length > 0 ? (
                <div className="cert-grid">
                  {certifications.map((cert, idx) => (
                    <div className="cert-card" key={idx}>
                      <div className="cert-index">{String(idx + 1).padStart(2, "0")}</div>
                      <h3>{safeText(cert.title, "Certification")}</h3>
                      <p className="muted-text">{safeText(cert.issuer, "Certification")}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-card">No certifications found.</div>
              )}
            </section>

            <section id="projects" className="content-section">
              <h2 className="section-title">Projects</h2>

              <div className="filter-row">
                {projectCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-chip ${projectFilter === category ? "active" : ""}`}
                    onClick={() => {
                      setProjectFilter(category);
                      setVisibleProjects(4);
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {shownProjects.length > 0 ? (
                <>
                  <div className="project-grid">
                    {shownProjects.map((project, idx) => (
                      <div className="project-card" key={idx}>
                        <div className="project-thumb">
                          <span>{safeText(project.title, "P").charAt(0).toUpperCase()}</span>
                        </div>

                        <div className="project-body">
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>

                          <div className="project-footer">
                            <span className="project-tag">{project.category}</span>
                            {project.link ? (
                              <a href={project.link} target="_blank" rel="noreferrer" className="text-link-btn">
                                View Project
                              </a>
                            ) : (
                              <button type="button" className="text-link-btn">View Project</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProjects.length > visibleProjects && (
                    <div className="load-more-wrap">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setVisibleProjects((prev) => prev + 2)}
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-card">No projects found.</div>
              )}
            </section>
          </div>

          <aside>
            <div className="contact-card sticky-card">
              <h3>Contact</h3>
              <button className="close-like-btn" type="button" onClick={() => setShowContact(true)}>
                ×
              </button>

              <div className="contact-item">
                <span className="label">Email</span>
                <p>{email}</p>
              </div>

              <div className="contact-item">
                <span className="label">Phone</span>
                <p>{phone}</p>
              </div>

              <div className="deploy-box">
                <button type="button" className="primary-btn deploy-btn" onClick={deploy} disabled={deployLoading}>
                  {deployLoading ? "Deploying..." : "Deploy Website"}
                </button>

                {link && (
                  <a className="deploy-link" href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {showContact && (
          <motion.div
            className="contact-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContact(false)}
          >
            <motion.div
              className="contact-modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" type="button" onClick={() => setShowContact(false)}>
                ×
              </button>

              <h2>Contact</h2>
              <div className="contact-modal-body">
                <div>
                  <span className="label">Email</span>
                  <p>{email}</p>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <p>{phone}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PreviewPage;