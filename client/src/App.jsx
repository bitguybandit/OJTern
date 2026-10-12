import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page
import Landing from './pages/Landing';

// Auth Pages (Sign In / Create Account on the same tabbed page)
import AuthPage from './pages/auth/AuthPage';

// Student Pages
import ProfileBuilder from './pages/student/ProfileBuilder';
import Recommendations from './pages/student/Recommendations';
import InternshipDetail from './pages/student/InternshipDetail';
import Apply from './pages/student/Apply';
import MyApplications from './pages/student/MyApplications';

// Partner Pages
import CompanyProfile from './pages/partner/CompanyProfile';
import PostingList from './pages/partner/PostingList';
import ScreenApplicants from './pages/partner/ScreenApplicants';

// Coordinator Pages
import Dashboard from './pages/coordinator/Dashboard';
import ApplicationsQueue from './pages/coordinator/ApplicationsQueue';
import ApplicationReview from './pages/coordinator/ApplicationReview';
import PlacementReport from './pages/coordinator/PlacementReport';
import CompanyVerification from './pages/coordinator/CompanyVerification';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';

// Fallback Page
import NotFound from './pages/NotFound';

// Root redirect handler based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, getDefaultRouteForRole, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Landing />;
  return <Navigate to={getDefaultRouteForRole(user.Role)} replace />;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content ml-64">
              <Routes>
                {/* Public / Auth */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />

                {/* Student Routes */}
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <ProfileBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/recommendations"
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <Recommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/postings/:id"
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <InternshipDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/apply/:postingId"
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <Apply />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications"
                  element={
                    <ProtectedRoute allowedRoles={['Student']}>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />

                {/* Industry Partner Routes */}
                <Route
                  path="/partner/company"
                  element={
                    <ProtectedRoute allowedRoles={['IndustryPartner']}>
                      <CompanyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner/postings"
                  element={
                    <ProtectedRoute allowedRoles={['IndustryPartner']}>
                      <PostingList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner/postings/:id/screen"
                  element={
                    <ProtectedRoute allowedRoles={['IndustryPartner']}>
                      <ScreenApplicants />
                    </ProtectedRoute>
                  }
                />

                {/* Coordinator Routes */}
                <Route
                  path="/coordinator/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['OJTCoordinator']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/applications"
                  element={
                    <ProtectedRoute allowedRoles={['OJTCoordinator']}>
                      <ApplicationsQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/applications/:id"
                  element={
                    <ProtectedRoute allowedRoles={['OJTCoordinator']}>
                      <ApplicationReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/report"
                  element={
                    <ProtectedRoute allowedRoles={['OJTCoordinator', 'SchoolAdministrator']}>
                      <PlacementReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coordinator/companies"
                  element={
                    <ProtectedRoute allowedRoles={['OJTCoordinator']}>
                      <CompanyVerification />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['SchoolAdministrator']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['SchoolAdministrator']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['SchoolAdministrator']}>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
