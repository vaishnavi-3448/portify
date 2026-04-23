import { Routes, Route } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import TemplateSelectionPage from "./pages/TemplateSelectionPage";
import PreviewPage from "./pages/PreviewPage";
import PublicPortfolioPage from "./pages/PublicPortfolioPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadForm />} />
      <Route path="/templates/:id" element={<TemplateSelectionPage />} />
      <Route path="/preview/:id" element={<PreviewPage />} />
      <Route path="/u/:slug" element={<PublicPortfolioPage />} />
    </Routes>
  );
}

export default App;