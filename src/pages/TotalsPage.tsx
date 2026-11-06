import { Badge, Center, Loader, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { useNavigate } from 'react-router'
import { getPaymentTotals } from '../api/payments.ts'
import { useApi } from '../api/useApi.ts'
import ErrorAlert from '../components/ErrorAlert.tsx'

function TotalsPage() {
  const navigate = useNavigate()
  const { data: totals, error, loading, reload } = useApi(getPaymentTotals, [])

  // Biggest debt first, then alphabetically
  const sorted = [...(totals ?? [])].sort(
    (a, b) => a.count - b.count || a.fullName.localeCompare(b.fullName, 'sk'),
  )

  const rows = sorted.map((total) => (
    <Table.Tr
      key={total.memberId}
      onClick={() => navigate('/members/' + total.memberId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate('/members/' + total.memberId)
      }}
      tabIndex={0}
      aria-label={'Detail: ' + total.fullName}
      style={{ cursor: 'pointer' }}
    >
      <Table.Td>{total.fullName}</Table.Td>
      <Table.Td ta="right">
        <Badge variant="light" color={total.count < 0 ? 'red' : total.count === 0 ? 'yellow' : 'teal'}>
          {total.count}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="lg">
      <Title>Neplatiči</Title>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      {loading && !totals ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : totals && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={320}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Člen</Table.Th>
                  <Table.Th ta="right">Zostatok tréningov</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={2}>
                      <Text c="dimmed" ta="center" py="md">Žiadne záznamy</Text>
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

export default TotalsPage
