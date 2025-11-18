import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { TeamProvider } from './context/TeamContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RetroBoard from './pages/RetroBoard.jsx';
import ActionItems from './pages/ActionItems.jsx';
import TeamManagement from './pages/TeamManagement.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TeamProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </TeamProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/retros/:retroId"
            element={
              <ProtectedRoute>
                <TeamProvider>
                  <Layout>
                    <RetroBoard />
                  </Layout>
                </TeamProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-items"
            element={
              <ProtectedRoute>
                <TeamProvider>
                  <Layout>
                    <ActionItems />
                  </Layout>
                </TeamProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-management"
            element={
              <ProtectedRoute>
                <TeamProvider>
                  <Layout>
                    <TeamManagement />
                  </Layout>
                </TeamProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
