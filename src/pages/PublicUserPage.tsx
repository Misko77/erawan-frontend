import { Anchor, Badge, Button, Container, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/client.ts'
import { getPublicMembers, type PublicMember } from '../api/public.ts'
import logo from '../assets/logo.jpeg'
import ErrorAlert from '../components/ErrorAlert.tsx'

function PublicUserPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [members, setMembers] = useState<PublicMember[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const query = lastName.trim()
    if (!query) return
    setError(null)
    setMembers(null)
    setLoading(true)
    try {
      setMembers(await getPublicMembers(query, firstName.trim() || undefined))
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMembers([])
      } else {
        setError(err instanceof Error ? err : new Error('Vyhľadávanie zlyhalo'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} py={{ base: 'xl', sm: 80 }}>
      <Image src={logo} alt="Logo" w={160} mx="auto" mb="md" />
      <Title order={2} ta="center" mb="lg">
        Zostatok tréningov
      </Title>
      <Stack>
        <Paper withBorder shadow="sm" p={{ base: 'md', sm: 'xl' }}>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                required
                label="Priezvisko"
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
              <TextInput
                label="Meno"
                description="Nepovinné"
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
              />
              <Button type="submit" fullWidth loading={loading}>
                Zobraziť
              </Button>
            </Stack>
          </form>
        </Paper>

        {error && <ErrorAlert error={error} title="Vyhľadávanie zlyhalo" />}

        {members && members.length === 0 && (
          <Text c="dimmed" ta="center">Člen sa nenašiel</Text>
        )}

        {members?.map((member, i) => (
          <Paper key={`${member.name}-${member.lastName}-${i}`} withBorder shadow="xs" p="md">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={500}>{member.name} {member.lastName}</Text>
              <Badge
                size="lg"
                variant="light"
                color={member.count < 0 ? 'red' : member.count === 0 ? 'yellow' : 'teal'}
              >
                {member.count}
              </Badge>
            </Group>
          </Paper>
        ))}

        <Anchor component={Link} to="/login" ta="center" size="sm">
          Späť na prihlásenie
        </Anchor>
      </Stack>
    </Container>
  )
}

export default PublicUserPage
