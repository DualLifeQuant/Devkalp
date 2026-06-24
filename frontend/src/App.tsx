import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import RootLayout from './app/layout';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Page components
import HomePage from './app/page';
import AboutPage from './app/about/page';
import ContactPage from './app/contact/page';
import PrivacyPage from './app/privacy/page';
import TermsPage from './app/terms/page';
import MatrimonyPage from './app/matrimony/page';
import MatrimonyRegisterPage from './app/matrimony/register/page';
import DonatePage from './app/donate/page';
import CampaignsPage from './app/campaigns/page';
import JobsPage from './app/jobs/page';
import JobDetailsPage from './app/jobs/[id]/page';
import VolunteerPage from './app/volunteer/page';
import EightyGPage from './app/80g/page';

// Auth pages
import LoginPage from './app/auth/login/page';
import RegisterPage from './app/auth/register/page';
import ForgotPasswordPage from './app/auth/forgot-password/page';

// User Dashboard pages
import DashboardVolunteerPage from './app/dashboard/volunteer/page';
import DashboardDonatePage from './app/dashboard/donate/page';
import DashboardJobsPage from './app/dashboard/jobs/page';
import DashboardMatrimonyPage from './app/dashboard/matrimony/page';
import DashboardMatrimonyProfilePage from './app/dashboard/matrimony/profile/page';
import DashboardMatrimonyMatchesPage from './app/dashboard/matrimony/matches/page';
import DashboardMatrimonyFamilyPage from './app/dashboard/matrimony/family/page';
import DashboardMatrimonyEvaluationPage from './app/dashboard/matrimony/evaluation/page';

// Counselor pages
import DashboardCounselorPage from './app/dashboard/counselor/page';
import DashboardCounselorSessionsPage from './app/dashboard/counselor/sessions/page';
import DashboardCounselorProfilesPage from './app/dashboard/counselor/profiles/page';

// Admin pages
import AdminDashboardPage from './app/admin/page';
import AdminDonationsPage from './app/admin/donations/page';
import AdminJobsPage from './app/admin/jobs/page';
import AdminVolunteersPage from './app/admin/volunteers/page';
import AdminMatrimonyPage from './app/admin/matrimony/page';
import AdminCounselorsPage from './app/admin/counselors/page';
import AdminUsersPage from './app/admin/users/page';
import AdminActivityPage from './app/admin/activity/page';
import AdminCampaignsPage from './app/admin/campaigns/page';
import AdminMessagesPage from './app/admin/messages/page';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RootLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/matrimony" element={<MatrimonyPage />} />
          <Route path="/matrimony/register" element={<MatrimonyRegisterPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/80g" element={<EightyGPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* User Dashboard Routes */}
          <Route path="/dashboard/volunteer" element={<DashboardVolunteerPage />} />
          <Route path="/dashboard/donate" element={<DashboardDonatePage />} />
          <Route path="/dashboard/jobs" element={<DashboardJobsPage />} />
          <Route path="/dashboard/matrimony" element={<DashboardMatrimonyPage />} />
          <Route path="/dashboard/matrimony/profile" element={<DashboardMatrimonyProfilePage />} />
          <Route path="/dashboard/matrimony/matches" element={<DashboardMatrimonyMatchesPage />} />
          <Route path="/dashboard/matrimony/family" element={<DashboardMatrimonyFamilyPage />} />
          <Route path="/dashboard/matrimony/evaluation" element={<DashboardMatrimonyEvaluationPage />} />

          {/* Counselor Routes */}
          <Route path="/dashboard/counselor" element={<DashboardCounselorPage />} />
          <Route path="/dashboard/counselor/sessions" element={<DashboardCounselorSessionsPage />} />
          <Route path="/dashboard/counselor/profiles" element={<DashboardCounselorProfilesPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/donations" element={<AdminDonationsPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/volunteers" element={<AdminVolunteersPage />} />
          <Route path="/admin/matrimony" element={<AdminMatrimonyPage />} />
          <Route path="/admin/counselors" element={<AdminCounselorsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/activity" element={<AdminActivityPage />} />
          <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
          <Route path="/admin/messages" element={<AdminMessagesPage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
