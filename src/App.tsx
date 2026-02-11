import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardNew from './pages/DashboardNew';
import Fields from './pages/Fields';
import WorkRecords from './pages/WorkRecords';
import AddWorkRecord from './pages/AddWorkRecord';
import Materials from './pages/Materials';
import MaterialUsage from './pages/MaterialUsage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
// 管理者用ページ
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizationManagement from './pages/admin/OrganizationManagement';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardNew />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/fields"
            element={
              <PrivateRoute>
                <Fields />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/work-records"
            element={
              <PrivateRoute>
                <WorkRecords />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/add-work-record"
            element={
              <PrivateRoute>
                <AddWorkRecord />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/materials"
            element={
              <PrivateRoute>
                <Materials />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/material-usage"
            element={
              <PrivateRoute>
                <MaterialUsage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          
          {/* 管理者用ルート */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/organizations"
            element={
              <PrivateRoute>
                <OrganizationManagement />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
