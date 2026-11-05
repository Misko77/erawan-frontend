import { Anchor, Button, Group, Paper, Select, SimpleGrid, Stack, Title } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { getMembers } from '../api/members.ts';
import { createPayment, paymentTypeOptions, type PaymentType } from '../api/payments.ts';
import { useApi } from '../api/useApi.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';

type FormValues = {
  memberId: string | null;
  type: PaymentType | null;
};

function NewPaymentPage() {
  const navigate = useNavigate();
  // ?memberId=… prefills the member and sends you back to their page afterwards
  const [searchParams] = useSearchParams();
  const presetMemberId = searchParams.get('memberId');
  const backTo = presetMemberId ? `/members/${presetMemberId}` : '/payments';

  const { data: members, error: membersError, reload } = useApi(getMembers, []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error>();

  const memberOptions = (members ?? [])
    .filter((m) => m.isActive || String(m.id) === presetMemberId)
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'sk') || a.name.localeCompare(b.name, 'sk'))
    .map((m) => ({ value: String(m.id), label: `${m.lastName} ${m.name}` }));

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: { memberId: presetMemberId, type: null },
    validateInputOnBlur: true,
    validate: {
      memberId: isNotEmpty('Vyberte člena'),
      type: isNotEmpty('Vyberte typ platby'),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    setError(undefined);
    try {
      await createPayment({ memberId: Number(values.memberId), type: values.type! });
      navigate(backTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg" maw={720}>
      <Anchor component={Link} to={backTo} size="sm">
        <Group gap={4}>
          <IconChevronLeft size={16} />
          Späť
        </Group>
      </Anchor>

      <Title>Nová platba</Title>

      {membersError && <ErrorAlert error={membersError} onRetry={reload} title="Nepodarilo sa načítať členov" />}
      {error && <ErrorAlert error={error} title="Vytvorenie platby zlyhalo" />}

      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Select
                label="Člen"
                withAsterisk
                placeholder={members ? 'Vyhľadať člena' : 'Načítavam…'}
                data={memberOptions}
                searchable
                nothingFoundMessage="Nenašiel sa žiadny člen"
                disabled={!members}
                key={form.key('memberId')}
                {...form.getInputProps('memberId')}
              />
              <Select
                label="Typ"
                withAsterisk
                placeholder="Vyberte typ"
                data={paymentTypeOptions}
                allowDeselect={false}
                key={form.key('type')}
                {...form.getInputProps('type')}
              />
            </SimpleGrid>

            <Group justify="flex-end" mt="sm">
              <Button component={Link} to={backTo} variant="default" disabled={saving}>
                Zrušiť
              </Button>
              <Button type="submit" loading={saving}>
                Vytvoriť
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}

export default NewPaymentPage;
