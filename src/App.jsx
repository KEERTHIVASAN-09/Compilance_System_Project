import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./component/Login";
import Signup from "./component/Signup";
import UserDashboard from "./component/dashboard/UserDashboard";
import ResolverDashboard from "./component/resolverdash/ResolverDashboard";
import AdminDashboard from "./component/admindash/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* USER DASHBOARD */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* RESOLVER DASHBOARD */}
        <Route path="/resolver-dashboard" element={<ResolverDashboard />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
