import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import Navbar from "./components/Navbar";
import AuthSystem from "@/components/ui/AuthSystem";

const App: React.FC = () => {
  return (
    <Router>
      <AuthSystem>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
        <Toaster position="bottom-right" />
      </AuthSystem>
    </Router>
  );
};

export default App;