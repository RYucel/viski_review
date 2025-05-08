import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy loaded components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const WhiskyListPage = React.lazy(() => import('./pages/WhiskyListPage'));
const WhiskyDetailPage = React.lazy(() => import('./pages/WhiskyDetailPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminWhiskyForm = React.lazy(() => import('./pages/admin/AdminWhiskyForm'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="large" /></div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="whiskies" element={<WhiskyListPage />} />
          <Route path="whiskies/:id" element={<WhiskyDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/whiskies/new" element={<AdminWhiskyForm />} />
          <Route path="admin/whiskies/:id/edit" element={<AdminWhiskyForm />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
