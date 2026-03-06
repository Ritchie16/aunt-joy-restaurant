import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layouts/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SalesDashboard from './pages/SalesDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { Logger } from './utils/helpers';

/**
 * Protected Route Component - RBAC implementation
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  Logger.debug(`ProtectedRoute check: authenticated=${isAuthenticated}, user role=${user?.role}, allowed=${allowedRoles}`);

  if (!isAuthenticated) {
    Logger.warn('Access denied: User not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    Logger.warn(`Access denied: User role ${user.role} not in allowed roles [${allowedRoles.join(', ')}]`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Public Route Component - redirects authenticated users
 */
const PublicRoute = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated } = useAuth();
  
  // For landing page and similar public pages, allow authenticated users too
  if (!allowAuthenticated && isAuthenticated) {
    Logger.debug('User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Role-based dashboard redirect
 */
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  Logger.debug(`Dashboard redirect for role: ${user?.role}`);

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'manager':
      return <Navigate to="/manager" replace />;
    case 'sales':
      return <Navigate to="/sales" replace />;
    case 'customer':
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/**
 * Main App Component
 */
function App() {
  Logger.info('Aunt Joy Restaurant App initialized');

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              {/* Public Routes - Landing Page accessible to all */}
              <Route path="/" element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } />
              
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Dashboard Redirect Route */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardRedirect />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Customer Routes */}
              <Route path="/customer/*" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <Routes>
                      <Route index element={<CustomerDashboard />} />
                      <Route path="menu" element={<CustomerDashboard />} />
                      <Route path="cart" element={<CustomerDashboard />} />
                      <Route path="orders" element={<CustomerDashboard />} />
                      <Route path="checkout" element={<CustomerDashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminDashboard />} />
                      <Route path="meals" element={<AdminDashboard />} />
                      <Route path="reports" element={<AdminDashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Sales Personnel Routes */}
              <Route path="/sales/*" element={
                <ProtectedRoute allowedRoles={['sales']}>
                  <Layout>
                    <Routes>
                      <Route index element={<SalesDashboard />} />
                      <Route path="orders" element={<SalesDashboard />} />
                      <Route path="customers" element={<SalesDashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Manager Routes */}
              <Route path="/manager/*" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Layout>
                    <Routes>
                      <Route index element={<ManagerDashboard />} />
                      <Route path="reports" element={<ManagerDashboard />} />
                      <Route path="analytics" element={<ManagerDashboard />} />
                      <Route path="staff" element={<ManagerDashboard />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Fallback Routes */}
              <Route path="/unauthorized" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Return to Home
                    </button>
                  </div>
                </div>
              } />

              <Route path="*" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
