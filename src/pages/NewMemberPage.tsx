import { Anchor, Button, Group, Paper, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createMember } from '../api/members.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';

type FormValues = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
};

const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim());

function NewMemberPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error>();

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: { name: '', lastName: '', email: '', phone: '' },
    validateInputOnBlur: true,
    validate: {
      name: isNotEmpty('Zadajte meno'),
      lastName: isNotEmpty('Zadajte priezvisko'),
      email: (value) => (value.trim() === '' ? null : isEmail('Neplatný email')(value.trim())),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    setError(undefined);
    try {
      const created = await createMember({
        name: values.name.trim(),
        lastName: values.lastName.trim(),
        email: emptyToNull(values.email),
        phone: emptyToNull(values.phone),
      });
      // Go to the new member's page if the API returned it, otherwise back to the list
      navigate(created?.id != null ? `/members/${created.id}` : '/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg" maw={720}>
      <Anchor component={Link} to="/" size="sm">
        <Group gap={4}>
          <IconChevronLeft size={16} />
          Späť na zoznam
        </Group>
      </Anchor>

      <Title>Nový člen</Title>

      {error && <ErrorAlert error={error} title="Vytvorenie člena zlyhalo" />}

      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Meno"
                withAsterisk
                autoComplete="given-name"
                key={form.key('name')}
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Priezvisko"
                withAsterisk
                autoComplete="family-name"
                key={form.key('lastName')}
                {...form.getInputProps('lastName')}
              />
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="meno@example.com"
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Telefón"
                type="tel"
                autoComplete="tel"
                placeholder="+421 900 000 000"
                key={form.key('phone')}
                {...form.getInputProps('phone')}
              />
            </SimpleGrid>

            <Group justify="flex-end" mt="sm">
              <Button component={Link} to="/" variant="default" disabled={saving}>
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

export default NewMemberPage;
