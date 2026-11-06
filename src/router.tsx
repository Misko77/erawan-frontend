import { createBrowserRouter } from 'react-router'
import RequireAuth from './auth/RequireAuth.tsx'
import RootLayout from './layouts/RootLayout.tsx'
import MemberPage from './pages/MemberPage.tsx'
import MembersPage from './pages/MembersPage.tsx'
import NewMemberPage from './pages/NewMemberPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import NewPaymentPage from './pages/NewPaymentPage.tsx'
import NewTrainingPage from './pages/NewTrainingPage.tsx'
import NotFound from './pages/NotFound.tsx'
import PaymentsPage from './pages/PaymentsPage.tsx'
import TotalsPage from './pages/TotalsPage.tsx'
import TrainingPage from './pages/TrainingPage.tsx'
import TrainingsPage from './pages/TrainingsPage.tsx'

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: (
        <RequireAuth>
          <RootLayout />
        </RequireAuth>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <MembersPage /> },
        { path: '/payments', element: <PaymentsPage /> },
        { path: '/payments/new', element: <NewPaymentPage /> },
        { path: '/trainings', element: <TrainingsPage /> },
        { path: '/trainings/new', element: <NewTrainingPage /> },
        { path: '/trainings/:id', element: <TrainingPage /> },
        { path: '/totals', element: <TotalsPage /> },
        { path: '/members/new', element: <NewMemberPage /> },
        { path: '/members/:id', element: <MemberPage /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
