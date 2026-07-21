import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import RootLayout from './app/layout';
import MaintenancePage from './components/MaintenancePage';
import AdminLayout from './components/layout/AdminLayout';
import { api } from './lib/api';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function useMaintenanceStatus() {
  const [status, setStatus] = useState({ checked: false, active: false, message: null as string | null });

  useEffect(() => {
    let mounted = true;
    api.get('/system/status')
      .then((res) => {
        if (mounted) setStatus({ checked: true, active: !!res.data.maintenance_mode, message: res.data.message });
      })
      .catch(() => {
        if (mounted) setStatus({ checked: true, active: false, message: null });
      });
    return () => { mounted = false; };
  }, []);

  return status;
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const maintenance = useMaintenanceStatus();
  const bypass = pathname.startsWith('/admin') || pathname.startsWith('/auth');

  if (maintenance.active && !bypass) {
    return <MaintenancePage message={maintenance.message} />;
  }
  return <>{children}</>;
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
import CSRPage from './app/csr/page';
import GalleryPage from './app/gallery/page';
import ScholarshipPage from './app/scholarship/page';

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
import AdminCSRPage from './app/admin/csr/page';
import AdminAwardsPage from './app/admin/awards/page';
import AdminPressPage from './app/admin/press/page';
import AdminGalleryPage from './app/admin/gallery/page';
import AdminPartnersPage from './app/admin/partners/page';
import AdminInstagramPage from './app/admin/instagram/page';
import AdminScholarshipsPage from './app/admin/scholarship/page';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RootLayout>
        <MaintenanceGate>
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
          <Route path="/scholarship" element={<ScholarshipPage />} />
          <Route path="/csr" element={<CSRPage />} />
          <Route path="/gallery" element={<GalleryPage />} />

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

          {/* Admin Routes — nested under a single persistent AdminLayout so the
              sidebar (and its scroll position) survives navigation between
              admin pages instead of unmounting/remounting on every click. */}
          <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="donations" element={<AdminDonationsPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="volunteers" element={<AdminVolunteersPage />} />
            <Route path="matrimony" element={<AdminMatrimonyPage />} />
            <Route path="counselors" element={<AdminCounselorsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="activity" element={<AdminActivityPage />} />
            <Route path="campaigns" element={<AdminCampaignsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="scholarship" element={<AdminScholarshipsPage />} />
            <Route path="csr" element={<AdminCSRPage />} />
            <Route path="awards" element={<AdminAwardsPage />} />
            <Route path="press" element={<AdminPressPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="instagram" element={<AdminInstagramPage />} />
          </Route>
        </Routes>
        </MaintenanceGate>
      </RootLayout>
    </BrowserRouter>
  );
}
