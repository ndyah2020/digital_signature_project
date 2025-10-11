import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
export function App() {
  return <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<ProtectedRoute>
                <Layout />
              </ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/users" element={<ProtectedRoute requiredRole="admin">
                  <Users />
                </ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute requiredRole="admin">
                  <Roles />
                </ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute requiredRole="admin">
                  <Logs />
                </ProtectedRoute>} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>;
}