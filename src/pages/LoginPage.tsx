import { Alert, Anchor, Button, Container, Image, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router'
import logo from '../assets/logo.jpeg'
import { useAuth } from '../auth/useAuth.ts'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container size={420} py={{ base: 'xl', sm: 80 }}>
      <Image src={logo} alt="Logo" w={160} mx="auto" mb="md" />
      <Title order={2} ta="center" mb="lg">
        Prihlásiť
      </Title>
      <Paper withBorder shadow="sm" p={{ base: 'md', sm: 'xl' }}>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              type="email"
              required
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              required
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth loading={submitting}>
              Prihlás 
            </Button>
          </Stack>
        </form>
      </Paper>
      <Anchor component={Link} to="/public" display="block" ta="center" size="sm" mt="md">
        Zobraziť zostatok tréningov bez prihlásenia
      </Anchor>
    </Container>
  )
}

export default LoginPage
