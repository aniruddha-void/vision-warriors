import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { ConsentManagerPage } from './pages/public/ConsentManagerPage';
import { FallbackOffersPage } from './pages/public/FallbackOffersPage';
import { CustomerCheckInPage } from './pages/public/CustomerCheckInPage';
import { ThanksPage } from './pages/public/ThanksPage';

// Owner app layout and pages
import { OwnerAppLayout } from './components/layout/OwnerAppLayout';
import { RequireRole } from './components/layout/RequireRole';
import { DashboardPage } from './pages/app/DashboardPage';
import { QrCodePage } from './pages/app/QrCodePage';
import { CustomersPage } from './pages/app/CustomersPage';
import { CustomerDetailPage } from './pages/app/CustomerDetailPage';
import { CategoryOffersPage } from './pages/app/CategoryOffersPage';
import { CategoryOfferDetailPage } from './pages/app/CategoryOfferDetailPage';
import { ReviewsPage } from './pages/app/ReviewsPage';
import { TasksPage } from './pages/app/TasksPage';
import { TemplatesPage } from './pages/app/TemplatesPage';
import { ImpactPage } from './pages/app/ImpactPage';
import { ConsentLogPage } from './pages/app/ConsentLogPage';
import { SettingsPage } from './pages/app/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/checkin/:shopId" element={<CustomerCheckInPage />} />
        <Route path="/thanks" element={<ThanksPage />} />
        <Route path="/consent/:customerId" element={<ConsentManagerPage />} />
        <Route path="/offers" element={<FallbackOffersPage />} />

        {/* Owner App Routes with RBAC Guards */}
        <Route path="/app" element={<OwnerAppLayout />}>
          <Route
            index
            element={
              <RequireRole roles={['owner', 'manager']}>
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="qr"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <QrCodePage />
              </RequireRole>
            }
          />
          <Route
            path="customers"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <CustomersPage />
              </RequireRole>
            }
          />
          <Route
            path="customers/:id"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <CustomerDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="offers"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <CategoryOffersPage />
              </RequireRole>
            }
          />
          <Route
            path="offers/:category"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <CategoryOfferDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="reviews"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <ReviewsPage />
              </RequireRole>
            }
          />
          <Route
            path="tasks"
            element={
              <RequireRole roles={['owner', 'manager', 'staff']}>
                <TasksPage />
              </RequireRole>
            }
          />
          <Route
            path="templates"
            element={
              <RequireRole roles={['owner', 'manager', 'staff']}>
                <TemplatesPage />
              </RequireRole>
            }
          />
          <Route
            path="impact"
            element={
              <RequireRole roles={['owner', 'manager']}>
                <ImpactPage />
              </RequireRole>
            }
          />
          <Route
            path="consent-log"
            element={
              <RequireRole roles={['owner', 'manager', 'auditor']}>
                <ConsentLogPage />
              </RequireRole>
            }
          />
          <Route
            path="settings"
            element={
              <RequireRole roles={['owner']}>
                <SettingsPage />
              </RequireRole>
            }
          />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
