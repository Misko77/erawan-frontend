import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'dayjs/locale/sk'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import AuthProvider from './auth/AuthProvider.tsx'
import { router } from './router.tsx'
import { theme } from './theme.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: 'sk', firstDayOfWeek: 1 }}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
