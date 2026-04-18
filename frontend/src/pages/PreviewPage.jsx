import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PreviewPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/resume/${id}`)
      .then((res) => setResume(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!resume) {
    return <p style={{ padding: "40px" }}>Loading website preview...</p>;
  }

  const data = resume.parsed_data;
  const template = resume.selected_template;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <p><b>Selected Template:</b> {template}</p>

      {template === "minimal-professional" && (
        <div style={{ maxWidth: "900px", margin: "0 auto", background: "#fff", padding: "30px" }}>
          <h1>{data.name}</h1>
          <p>{data.email} | {data.phone}</p>

          <h2>Education</h2>
          <ul>{data.education?.map((item, i) => <li key={i}>{item}</li>)}</ul>

          <h2>Experience</h2>
          <ul>{data.experience?.map((item, i) => <li key={i}>{item}</li>)}</ul>

          <h2>Projects</h2>
          <ul>{data.projects?.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {template === "modern-developer" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", background: "#f8fafc", padding: "30px", borderRadius: "16px" }}>
          <h1>{data.name}</h1>
          <p><b>Email:</b> {data.email}</p>
          <p><b>Phone:</b> {data.phone}</p>

          <div style={{ marginTop: "20px" }}>
            <h2>Projects</h2>
            <ul>{data.projects?.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2>Experience</h2>
            <ul>{data.experience?.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2>Education</h2>
            <ul>{data.education?.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
        </div>
      )}

      {template === "creative-dark" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", background: "#111827", color: "white", padding: "30px", borderRadius: "16px" }}>
          <h1>{data.name}</h1>
          <p>{data.email}</p>
          <p>{data.phone}</p>

          <h2>Projects</h2>
          <ul>{data.projects?.map((item, i) => <li key={i}>{item}</li>)}</ul>

          <h2>Experience</h2>
          <ul>{data.experience?.map((item, i) => <li key={i}>{item}</li>)}</ul>

          <h2>Education</h2>
          <ul>{data.education?.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <button>Deploy Website</button>
      </div>
    </div>
  );
}

export default PreviewPage;