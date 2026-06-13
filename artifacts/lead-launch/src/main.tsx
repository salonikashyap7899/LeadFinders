import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import "./index.css";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={BASE}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<App />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  </BrowserRouter>
);
