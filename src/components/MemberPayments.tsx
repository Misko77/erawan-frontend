import { Badge, Center, Loader, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { useMemo } from 'react'
import { getMemberPayments, paymentTypeLabels } from '../api/payments.ts'
import { useApi } from '../api/useApi.ts'
import { formatCurrency, formatDateTime } from '../utils/format.ts'
import ErrorAlert from './ErrorAlert.tsx'


function MemberPayments({ memberId }: { memberId: string | number }) {
  const { data, error, loading, reload } = useApi(
    (signal) => getMemberPayments(memberId, signal),
    [memberId],
  )

  // Newest first
  const payments = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data],
  )
  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Stack gap="sm">
      <Title order={3}>Platby</Title>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      {loading && !data ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : data && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={480}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Dátum</Table.Th>
                  <Table.Th>Typ</Table.Th>
                  <Table.Th ta="right">Suma</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <Table.Tr key={payment.id}>
                      <Table.Td>{formatDateTime(payment.createdAt)}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={payment.type === 'Bulk10' ? 'violet' : 'gray'}>
                          {paymentTypeLabels[payment.type] ?? payment.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">{formatCurrency(payment.amount)}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Text c="dimmed" ta="center" py="md">Žiadne platby</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
              {payments.length > 0 && (
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th colSpan={2}>Spolu</Table.Th>
                    <Table.Th ta="right">{formatCurrency(total)}</Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              )}
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Stack>
  )
}

export default MemberPayments
