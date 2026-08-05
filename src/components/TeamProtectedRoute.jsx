import { Navigate } from "react-router-dom";
import { isTeamLoggedIn } from "../lib/api";

export default function TeamProtectedRoute({ children }) {
  if (!isTeamLoggedIn()) {
    return <Navigate to="/team/login" replace />;
  }
  return children;
}
