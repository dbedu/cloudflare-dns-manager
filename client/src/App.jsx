import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/loginForm';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import ForceKeyChangeModal from './components/ForceKeyChangeModal';
import './i18n'; // Import i18n configuration
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nextProvider>
    </Router>
  );
}

// New component to wrap content that needs AuthProvider
const AppContent = () => {
  const { user, forceKeyChange } = useAuth();

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      {user && forceKeyChange && (
        <ForceKeyChangeModal 
          isOpen={forceKeyChange} 
        />
      )}
    </div>
  );
};

export default App;
