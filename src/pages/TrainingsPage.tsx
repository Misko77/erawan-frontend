import { Badge, Button, Center, Group, Loader, Paper, Stack, Table, Text, TextInput, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { getTrainings, trainingTypeColors, trainingTypeLabels } from '../api/trainings.ts'
import { useApi } from '../api/useApi.ts'
import ErrorAlert from '../components/ErrorAlert.tsx'
import { addDaysIsoDate, formatDate, todayIsoDate } from '../utils/format.ts'

function TrainingsPage() {
  // Date range lives in the URL (?od=...&do=...) so it survives navigation.
  // Missing param = default (last 30 days); empty param = no bound.
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const defaultTo = todayIsoDate()
  const defaultFrom = addDaysIsoDate(defaultTo, -30)
  const from = searchParams.get('od') ?? defaultFrom
  const to = searchParams.get('do') ?? defaultTo

  const setDateParam = (key: 'od' | 'do', value: string, defaultValue: string) => {
    setSearchParams(
      (params) => {
        if (value === defaultValue) params.delete(key)
        else params.set(key, value)
        return params
      },
      { replace: true },
    )
  }

  const { data: trainings, error, loading, reload } = useApi(
    (signal) => getTrainings({ from, to }, signal),
    [from, to],
  )

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title>Tréningy</Title>
        <Button component={Link} to="/trainings/new" leftSection={<IconPlus size={16} />}>
          Nový tréning
        </Button>
      </Group>

      <Group gap="sm" align="flex-end">
        <TextInput
          label="Od"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setDateParam('od', e.currentTarget.value, defaultFrom)}
        />
        <TextInput
          label="Do"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setDateParam('do', e.currentTarget.value, defaultTo)}
        />
        {loading && trainings && <Loader size="sm" mb={8} />}
      </Group>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      {loading && !trainings ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : trainings && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={480}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Dátum</Table.Th>
                  <Table.Th>Typ</Table.Th>
                  <Table.Th>Vytvoril</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trainings.length > 0 ? (
                  trainings.map((training) => (
                    <Table.Tr
                      key={training.id}
                      onClick={() => navigate('/trainings/' + training.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate('/trainings/' + training.id)
                      }}
                      tabIndex={0}
                      aria-label={'Detail tréningu ' + formatDate(training.date)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Table.Td>{formatDate(training.date)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={trainingTypeColors[training.type] ?? 'gray'}>
                          {trainingTypeLabels[training.type] ?? training.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{training.createdBy}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Text c="dimmed" ta="center" py="md">Žiadne tréningy</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Stack>
  )
}

export default TrainingsPage
