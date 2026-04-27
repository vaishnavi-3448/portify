import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PortfolioPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`http://98.93.120.138:5000/resume/${id}`)
      .then((res) => setData(res.data.parsed_data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>{data.name}</h1>
      <p><b>Email:</b> {data.email}</p>
      <p><b>Phone:</b> {data.phone}</p>

      <h2>Education</h2>
      <ul>
        {data.education.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>Experience</h2>
      <ul>
        {data.experience.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>Projects</h2>
      <ul>
        {data.projects.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default PortfolioPage;
