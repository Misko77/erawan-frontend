import { Badge, Center, Loader, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { getMemberTrainings, trainingTypeColors, trainingTypeLabels } from '../api/trainings.ts'
import { useApi } from '../api/useApi.ts'
import { formatDate } from '../utils/format.ts'
import ErrorAlert from './ErrorAlert.tsx'

function MemberTrainings({ memberId }: { memberId: string | number }) {
  const { data: trainings, error, loading, reload } = useApi(
    (signal) => getMemberTrainings(memberId, signal),
    [memberId],
  )

  return (
    <Stack gap="sm">
      <Title order={2}>Tréningy</Title>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      {loading && !trainings ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : trainings && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={360}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Dátum</Table.Th>
                  <Table.Th>Typ</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trainings.length > 0 ? (
                  trainings.map((training) => (
                    <Table.Tr key={training.id}>
                      <Table.Td>{formatDate(training.date)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={trainingTypeColors[training.type] ?? 'gray'}>
                          {trainingTypeLabels[training.type] ?? training.type}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={2}>
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

export default MemberTrainings
