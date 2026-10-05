import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { SiteLayout } from './components/layout/SiteLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/AuthPages').then((module) => ({ default: module.RegisterPage })))
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'))
const SavedProjectsPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.SavedProjectsPage })))
const EnquiriesPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.EnquiriesPage })))
const AppointmentsPage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.AppointmentsPage })))
const ProfilePage = lazy(() => import('./pages/account/AccountPages').then((module) => ({ default: module.ProfilePage })))

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<Navigate to="saved" replace />} />
          <Route path="saved" element={<SavedProjectsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
