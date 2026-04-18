import { Routes, Route } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import PortfolioPage from "./pages/PortfolioPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadForm />} />
      <Route path="/portfolio/:id" element={<PortfolioPage />} />
    </Routes>
  );
}

export default App;