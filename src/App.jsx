import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ProblemStatements from "./pages/ProblemStatements";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProblemStatements from "./pages/AdminProblemStatements";
import AdminSiteContent from "./pages/AdminSiteContent";
import TeamLogin from "./pages/TeamLogin";
import TeamDashboard from "./pages/TeamDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import TeamProtectedRoute from "./components/TeamProtectedRoute";
import Scene3D from "./background/Scene3D";
import NoiseOverlay from "./effects/NoiseOverlay";

export default function App() {
  return (
    <BrowserRouter>
      <Scene3D />
      <NoiseOverlay />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problem-statements" element={<ProblemStatements />} />
        <Route path="/team/login" element={<TeamLogin />} />
        <Route
          path="/team/dashboard"
          element={
            <TeamProtectedRoute>
              <TeamDashboard />
            </TeamProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <ProtectedRoute>
              <AdminProblemStatements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site-content"
          element={
            <ProtectedRoute>
              <AdminSiteContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}