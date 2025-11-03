import Loading from './components/Loading'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { IsDesktop } from '@/utils'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))
const DictImportPage = lazy(() => import('./pages/DictImport'))

const MobilePrompt = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-sm space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800">
      <div className="text-5xl">💻</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard English</h1>
      <p className="text-gray-600 dark:text-gray-300">
        为了给你最好的体验，建议使用<strong>桌面浏览器</strong>访问本应用。
      </p>
      <div className="space-y-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">为什么需要桌面？</p>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✓ 更好的键盘打字体验</li>
          <li>✓ 完整的功能支持</li>
          <li>✓ 更舒适的屏幕尺寸</li>
          <li>✓ 完美的数据统计展示</li>
        </ul>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">若你需要在移动设备上使用，建议使用外接键盘获得最佳体验。</p>
    </div>
  </div>
)

if (process.env.NODE_ENV === 'production') {
  // for prod
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  // for dev
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const [isMobile, setIsMobile] = useState(!IsDesktop())

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  if (isMobile) {
    return (
      <React.StrictMode>
        <ThemeProvider>
          <MobilePrompt />
        </ThemeProvider>
      </React.StrictMode>
    )
  }

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <ThemeProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route index element={<TypingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/error-book" element={<ErrorBook />} />
              <Route path="/dict-import" element={<DictImportPage />} />
              <Route path="/*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
