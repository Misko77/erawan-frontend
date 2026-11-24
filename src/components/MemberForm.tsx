import { Button, Group, Paper, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { Link } from 'react-router';
import type { CreateMemberRequest, Member } from '../api/members.ts';

type FormValues = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  memberNumber: string;
};

type Props = {
  /** Existing member to prefill the form with (edit mode) */
  member?: Member;
  submitLabel: string;
  cancelTo: string;
  saving: boolean;
  onSubmit: (request: CreateMemberRequest) => void;
};

const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim());

function MemberForm({ member, submitLabel, cancelTo, saving, onSubmit }: Props) {
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: member?.name ?? '',
      lastName: member?.lastName ?? '',
      email: member?.email ?? '',
      phone: member?.phone ?? '',
      memberNumber: member?.memberNumber ?? '',
    },
    validateInputOnBlur: true,
    validate: {
      name: isNotEmpty('Zadajte meno'),
      lastName: isNotEmpty('Zadajte priezvisko'),
      email: (value) => (value.trim() === '' ? null : isEmail('Neplatný e-mail')(value.trim())),
    },
  });

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      name: values.name.trim(),
      lastName: values.lastName.trim(),
      email: emptyToNull(values.email),
      phone: emptyToNull(values.phone),
      memberNumber: emptyToNull(values.memberNumber),
    });

  return (
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
              label="E-mail"
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
            <TextInput
              label="Číslo karty"
              maxLength={10}
              key={form.key('memberNumber')}
              {...form.getInputProps('memberNumber')}
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="sm">
            <Button component={Link} to={cancelTo} variant="default" disabled={saving}>
              Zrušiť
            </Button>
            <Button type="submit" loading={saving}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

export default MemberForm;
