import { Anchor, Badge, Center, Group, Loader, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../api/client.ts';
import { getMember } from '../api/members.ts';
import { getMemberPaymentTotal } from '../api/payments.ts';
import { useApi } from '../api/useApi.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';
import MemberPayments from '../components/MemberPayments.tsx';
import MemberStatusButton from '../components/MemberStatusButton.tsx';
import MemberTrainings from '../components/MemberTrainings.tsx';
import { formatDateTime } from '../utils/format.ts';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value}</Text>
    </div>
  );
}

function MemberPage() {
  const { id = '' } = useParams();
  const { data: member, error, loading, reload } = useApi((signal) => getMember(id, signal), [id]);
  const { data: paymentTotal } = useApi((signal) => getMemberPaymentTotal(id, signal), [id]);

  const backLink = (
    <Anchor component={Link} to="/" size="sm">
      <Group gap={4}>
        <IconChevronLeft size={16} />
        Späť na zoznam
      </Group>
    </Anchor>
  );

  if (loading && !member) {
    return (
      <Stack gap="lg">
        {backLink}
        <Center py="xl">
          <Loader />
        </Center>
      </Stack>
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Stack gap="lg">
        {backLink}
        <Title order={2}>Člen nenájdený</Title>
      </Stack>
    );
  }

  if (error || !member) {
    return (
      <Stack gap="lg">
        {backLink}
        {error && <ErrorAlert error={error} onRetry={reload} />}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {backLink}
      <Group justify="space-between" align="flex-start">
        <Group gap="sm" align="center">
          <Title>
            {member.name} {member.lastName}
          </Title>
          <Badge color={member.isActive ? 'teal' : 'red'} variant="light" size="lg">
            {member.isActive ? 'Aktívny' : 'Neaktívny'}
          </Badge>
          {paymentTotal && (
            <Tooltip label="Zostávajúce tréningy">
              <Badge
                color={paymentTotal.count > 0 ? 'teal' : 'red'}
                variant="light"
                size="lg"
              >
                Zostávajúce tréningy: {paymentTotal.count}
              </Badge>
            </Tooltip>
          )}
        </Group>
        <MemberStatusButton member={member} onChanged={reload} />
      </Group>
      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Field label="Id" value={member.id} />
          <Field label="Telefón" value={member.phone ?? '—'} />
          <Field label="Email" value={member.email ?? '—'} />
          <Field label="Vytvorený" value={formatDateTime(member.createdAt)} />
          <Field label="Upravený" value={formatDateTime(member.updatedAt)} />
        </SimpleGrid>
      </Paper>

      <MemberTrainings memberId={member.id} />

      <MemberPayments memberId={member.id} />
    </Stack>
  );
}

export default MemberPage;
