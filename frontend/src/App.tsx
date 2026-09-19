import { Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { Landing } from "./pages/Landing"
import { Login } from "./features/auth/pages/Login"
import { Register } from "./features/auth/pages/Register"
import { ForgotPassword } from "./features/auth/pages/ForgotPassword"

import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import Documents from "./pages/Documents"
import { SemanticSearch } from "./pages/SemanticSearch"
import AutomateTasks from "./pages/AutomateTasks"
import ConnectTools from "./pages/ConnectTools"
import Analytics from "./pages/Analytics"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"

import Admin from "./pages/Admin"
import AdminUsers from "./pages/AdminUsers"
import RoleRequests from "./pages/RoleRequests"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { Unauthorized } from "./pages/Unauthorized"
import { EmployeeDashboard } from "./pages/EmployeeDashboard"
import { ManagerDashboard } from "./pages/ManagerDashboard"
import { AdminDashboard } from "./pages/AdminDashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<AppLayout />}>
        {/* General authenticated workspace access */}
        <Route element={<ProtectedRoute allowedRoles={["employee", "manager", "admin"]} />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/search" element={<SemanticSearch />} />
          <Route path="/automate" element={<AutomateTasks />} />
          <Route path="/integrations" element={<ConnectTools />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Manager and above access */}
        <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        </Route>

        {/* Admin only access */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/role-requests" element={<RoleRequests />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App

