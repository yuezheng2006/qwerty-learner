import Loading from './components/Loading'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
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

if (process.env.NODE_ENV === 'production') {
  // for prod
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  // for dev
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

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
