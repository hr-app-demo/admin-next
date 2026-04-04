import { ConfigProvider } from '@arco-design/web-react'
import zhCN from '@arco-design/web-react/es/locale/zh-CN'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import CandidateDetailPage from './pages/candidates/CandidateDetailPage'
import CandidatePoolPage from './pages/candidates/CandidatePoolPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CreateJobPage from './pages/jobs/CreateJobPage'
import JobDetailPage from './pages/jobs/JobDetailPage'
import JobsPage from './pages/jobs/JobsPage'
import MailAccountsPage from './pages/mail/MailAccountsPage'
import MailSignatureTemplatesPage from './pages/mail/MailSignatureTemplatesPage'
import MailTemplatesPage from './pages/mail/MailTemplatesPage'
import ProgressPage from './pages/progress/ProgressPage'
import NoAccessPage from './pages/system/NoAccessPage'
import DictionarySettingsPage from './pages/settings/DictionarySettingsPage'
import FormSettingsPage from './pages/settings/FormSettingsPage'
import PermissionSettingsPage from './pages/settings/PermissionSettingsPage'
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage'
import RequireAuth from './routes/RequireAuth'
import SettingsEntryRedirect from './routes/SettingsEntryRedirect'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:jobId" element={<JobDetailPage />} />
              <Route path="jobs/:jobId/progress" element={<ProgressPage />} />
              <Route path="candidates" element={<CandidatePoolPage />} />
              <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
              <Route path="mail" element={<Navigate to="/mail/templates" replace />} />
              <Route path="mail/templates" element={<MailTemplatesPage />} />
              <Route path="mail/signatures" element={<MailSignatureTemplatesPage />} />
              <Route path="mail/accounts" element={<MailAccountsPage />} />
              <Route path="no-access" element={<NoAccessPage />} />
              <Route path="settings" element={<SettingsEntryRedirect />} />
              <Route path="settings/account" element={<ProfileSettingsPage />} />
              <Route path="settings/permission" element={<PermissionSettingsPage />} />
              <Route path="settings/dictionaries" element={<DictionarySettingsPage />} />
              <Route path="settings/form" element={<FormSettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
