import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { SiteLayout } from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { LegacyRedirect } from './routes/redirects'
import { routes } from './lib/routes'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const RealEstatePage = lazy(() => import('./pages/RealEstatePage'))
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'))
const PropertyGalleryPage = lazy(() => import('./pages/PropertyGalleryPage'))
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'))
const LoginPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.ResetPasswordPage })))
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'))
const OverviewPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.OverviewPage })))
const SavedPropertiesPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.SavedPropertiesPage })))
const SavedProjectsPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.SavedProjectsPage })))
const EnquiriesPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.EnquiriesPage })))
const ConsultationsPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.ConsultationsPage })))
const DesignTokensPage = import.meta.env.DEV ? lazy(() => import('./pages/dev/DesignTokensPage')) : null
const ProfilePage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.ProfilePage })))

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />

        {/* Canonical routes (spec §05). */}
        <Route path="construction" element={<ProjectsPage />} />
        <Route path="construction/:slug" element={<ProjectDetailPage />} />
        <Route path="real-estate" element={<RealEstatePage />} />
        <Route path="real-estate/:slug" element={<PropertyDetailPage />} />
        <Route path="real-estate/:slug/gallery" element={<PropertyGalleryPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:slug" element={<ServiceDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="consultation" element={<ConsultationPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="saved-projects" element={<SavedProjectsPage />} />
          <Route path="saved-properties" element={<SavedPropertiesPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          {/* Retired account paths. */}
          <Route path="saved" element={<LegacyRedirect to={() => routes.account.savedProjects} />} />
          <Route path="appointments" element={<LegacyRedirect to={() => routes.account.consultations} />} />
        </Route>

        {/* Retired public paths (HTTP 301s for these live in the host config). */}
        <Route path="projects" element={<LegacyRedirect to={() => routes.construction} />} />
        <Route path="projects/:slug" element={<LegacyRedirect to={({ slug = '' }) => routes.project(slug)} />} />

        {DesignTokensPage && <Route path="__design" element={<DesignTokensPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
