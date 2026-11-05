import { Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router'
import { useAuth } from '../auth/useAuth.ts'

// Dummy login: accepts any input and lets everyone in.
function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const address = email.trim() || 'demo@example.com'
    login({ id: 'dummy', name: address.split('@')[0], email: address })
    navigate(from, { replace: true })
  }

  return (
    <Container size={420} py={{ base: 'xl', sm: 80 }}>
      <Title order={2} ta="center" mb="lg">
        Log in
      </Title>
      <Paper withBorder shadow="sm" p={{ base: 'md', sm: 'xl' }}>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" fullWidth>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default LoginPage
