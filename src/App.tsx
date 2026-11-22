import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './auth/LoginPage'
import { RegisterPage } from './auth/RegisterPage'
import { AppShell } from './shell/AppShell'
import { TodayPage } from './pages/TodayPage'
import { BillsPage } from './pages/BillsPage'
import { OrdersPage } from './pages/OrdersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { AboutPage } from './pages/AboutPage'
import { Panel, PageHeader } from './ui/kit'
import { FeaturePanel, FeatureProvider, useFeature } from './features/feature-pack'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function FeaturesPage() {
  const { toast } = useFeature()
  return (
    <>
      <PageHeader title="Feature guide" subtitle="Everything available in this workspace, with its source path" />
      <Panel>
        <FeaturePanel onToast={toast} />
      </Panel>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<TodayPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/new" element={<NewOrderPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="features" element={<FeaturesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FeatureProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
