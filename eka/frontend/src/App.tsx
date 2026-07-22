import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"

import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import Documents from "./pages/Documents"
import Search from "./pages/Search"
import Analytics from "./pages/Analytics"
import Admin from "./pages/Admin"
import Settings from "./pages/Settings"

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/search" element={<Search />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
