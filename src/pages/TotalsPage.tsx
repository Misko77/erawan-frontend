import { Center, Loader, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { useNavigate } from 'react-router'
import { getPaymentTotals } from '../api/payments.ts'
import { useApi } from '../api/useApi.ts'
import ErrorAlert from '../components/ErrorAlert.tsx'
import { TrainingBalanceBadge } from '../components/TrainingBalance.tsx'

function TotalsPage() {
  const navigate = useNavigate()
  const { data: totals, error, loading, reload } = useApi(getPaymentTotals, [])

  // Biggest group debt first, then private debt, then alphabetically
  const sorted = [...(totals ?? [])].sort(
    (a, b) =>
      a.groupCount - b.groupCount ||
      a.privateCount - b.privateCount ||
      a.fullName.localeCompare(b.fullName, 'sk'),
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
        <TrainingBalanceBadge count={total.groupCount} />
      </Table.Td>
      <Table.Td ta="right">
        <TrainingBalanceBadge count={total.privateCount} />
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
                  <Table.Th ta="right">Skupinové</Table.Th>
                  <Table.Th ta="right">Súkromné</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
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
