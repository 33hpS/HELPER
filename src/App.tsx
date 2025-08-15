import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import DocumentsPage from './pages/Documents'
import ImagesPage from './pages/Images'
import SearchPage from './pages/Search'
import SettingsPage from './pages/Settings'
import { ThemeProvider } from './components/theme/ThemeProvider'
import AssistantWidget from './components/ai/AssistantWidget'
import MetaTags from './components/meta/MetaTags'
import { Toaster } from 'sonner'
import SiteHeader from './components/layout/SiteHeader'

/**
 * App - корневой маршрутизатор приложения c ThemeProvider, метатегами, хедером и глобальным AI-виджетом.
 */
export default function App() {
  return (
    <ThemeProvider>
      {/* Глобальные метатеги и фавикон */}
      <MetaTags />

      {/* Глобальный Toaster для уведомлений */}
      <Toaster position="bottom-right" />

      <HashRouter>
        {/* Общий хедер */}
        <SiteHeader />

        {/* Маршруты */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

        {/* Глобальный AI ассистент */}
        <AssistantWidget />
      </HashRouter>
    </ThemeProvider>
  )
}
