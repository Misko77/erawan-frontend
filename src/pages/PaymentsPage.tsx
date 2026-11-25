import { Badge, Button, Center, Group, Loader, Modal, Paper, Select, Stack, Table, Text, TextInput, Title, Tooltip } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconArrowRight, IconCurrencyEuro, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { getMembers } from '../api/members.ts'
import {
  getPayments,
  paymentMethodTypeLabels,
  paymentMethodTypeOptions,
  paymentTypeBadge,
  paymentTypeLabels,
  paymentTypeOptions,
  updatePayment,
  type Payment,
  type PaymentMethodType,
  type PaymentType,
} from '../api/payments.ts'
import { useApi } from '../api/useApi.ts'
import ErrorAlert from '../components/ErrorAlert.tsx'
import { formatCurrency, formatDate, formatDateTime, todayIsoDate } from '../utils/format.ts'

const paymentMethodIcons: Record<PaymentMethodType, typeof IconCurrencyEuro> = {
  BankTransfer: IconArrowRight,
  Cash: IconCurrencyEuro,
}

function PaymentMethodIcon({ method }: { method: PaymentMethodType | undefined }) {
  const Icon = method ? paymentMethodIcons[method] : undefined
  if (!method || !Icon) return null
  const label = paymentMethodTypeLabels[method]
  return (
    <Tooltip label={label}>
      <Icon
        size={20}
        stroke={2.5}
        color="var(--mantine-color-yellow-filled)"
        aria-label={label}
        style={{ display: 'block' }}
      />
    </Tooltip>
  )
}

function EditPaymentModal({
  payment,
  memberName,
  onClose,
  onSaved,
}: {
  payment: Payment | undefined
  memberName: string
  onClose: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<PaymentType | null>(payment?.type ?? null)
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType | null>(
    payment?.paymentMethodType ?? null,
  )
  const [paidAt, setPaidAt] = useState<string | null>(payment?.paidAt ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error>()

  const changed =
    type !== payment?.type || paymentMethodType !== payment?.paymentMethodType || paidAt !== payment?.paidAt

  const handleSave = async () => {
    if (!payment || !type || !paymentMethodType || !paidAt) return
    setSaving(true)
    setError(undefined)
    try {
      await updatePayment(payment.id, { type, paymentMethodType, paidAt })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={payment !== undefined} onClose={onClose} title="Upraviť platbu"
      centered
      // Modal already renders the title as <h2>; style it as a heading instead of nesting a <Title>.
      styles={{ title: { fontSize: 'var(--mantine-h3-font-size)', fontWeight: 'var(--mantine-h3-font-weight)' } }}
    >
      {payment && (
        <Stack>
          {error && <ErrorAlert error={error} title="Uloženie zlyhalo" />}
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Člen</Text>
            <Text>{memberName}</Text>
          </div>
          <TextInput label="Vytvorené" value={formatDateTime(payment.createdAt)} readOnly />
          <DatePickerInput
            label="Dátum platby"
            valueFormat="DD.MM.YYYY"
            placeholder="dd.mm.rrrr"
            maxDate={todayIsoDate()}
            value={paidAt}
            onChange={setPaidAt}
            error={!paidAt ? 'Zadajte dátum platby' : undefined}
          />
          <Select
            label="Typ"
            data={paymentTypeOptions}
            value={type}
            onChange={(value) => setType(value as PaymentType | null)}
            allowDeselect={false}
            description={type !== payment.type ? 'Suma sa prepočíta podľa nového typu' : undefined}
          />
          <Select
            label="Spôsob platby"
            placeholder="Vyberte spôsob"
            data={paymentMethodTypeOptions}
            value={paymentMethodType}
            onChange={(value) => setPaymentMethodType(value as PaymentMethodType | null)}
            allowDeselect={false}
            error={!paymentMethodType ? 'Vyberte spôsob platby' : undefined}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={saving}>
              Zrušiť
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!type || !paymentMethodType || !paidAt || !changed}>
              Uložiť
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  )
}

function PaymentsPage() {
  const { data: payments, error, loading, reload } = useApi(getPayments, [])
  const { data: members, error: membersError, reload: reloadMembers } = useApi(getMembers, [])
  const [editing, setEditing] = useState<Payment>()

  const memberNames = new Map((members ?? []).map((m) => [m.id, `${m.lastName} ${m.name}`]))
  const memberName = (id: number) => memberNames.get(id) ?? (members ? `#${id}` : '…')

  const rows = (payments ?? []).map((payment) => (
    <Table.Tr
      key={payment.id}
      onClick={() => setEditing(payment)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setEditing(payment)
      }}
      tabIndex={0}
      aria-label={'Upraviť platbu ' + payment.id}
      style={{ cursor: 'pointer' }}
    >
      <Table.Td>{formatDate(payment.paidAt)}</Table.Td>
      <Table.Td>{memberName(payment.memberId)}</Table.Td>
      <Table.Td>
        <Badge {...(paymentTypeBadge[payment.type] ?? { color: 'gray', variant: 'light' })}>
          {paymentTypeLabels[payment.type] ?? payment.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <PaymentMethodIcon method={payment.paymentMethodType} />
      </Table.Td>
      <Table.Td ta="right">{formatCurrency(payment.amount)}</Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title>Platby</Title>
        <Button component={Link} to="/payments/new" leftSection={<IconPlus size={16} />}>
          Nová platba
        </Button>
      </Group>

      {error && <ErrorAlert error={error} onRetry={reload} />}
      {membersError && <ErrorAlert error={membersError} onRetry={reloadMembers} title="Nepodarilo sa načítať členov" />}

      {loading && !payments ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : payments && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={560}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Dátum</Table.Th>
                  <Table.Th>Člen</Table.Th>
                  <Table.Th>Typ</Table.Th>
                  <Table.Th>Spôsob</Table.Th>
                  <Table.Th ta="right">Suma</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">Žiadne platby</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      <EditPaymentModal
        key={editing?.id}
        payment={editing}
        memberName={editing ? memberName(editing.memberId) : ''}
        onClose={() => setEditing(undefined)}
        onSaved={reload}
      />
    </Stack>
  )
}

export default PaymentsPage
