import { Anchor, Button, Group, Paper, Select, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createTraining, trainingTypeLabels, type TrainingType } from '../api/trainings.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';
import { todayIsoDate } from '../utils/format.ts';

type FormValues = {
  date: string;
  type: TrainingType | null;
};

const typeOptions = (Object.keys(trainingTypeLabels) as TrainingType[]).map((value) => ({
  value,
  label: trainingTypeLabels[value],
}));

function NewTrainingPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error>();

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: { date: todayIsoDate(), type: null },
    validateInputOnBlur: true,
    validate: {
      date: isNotEmpty('Zadajte dátum'),
      type: isNotEmpty('Vyberte typ tréningu'),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    setError(undefined);
    try {
      await createTraining({ date: values.date, type: values.type! });
      navigate('/trainings', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg" maw={720}>
      <Anchor component={Link} to="/trainings" size="sm">
        <Group gap={4}>
          <IconChevronLeft size={16} />
          Späť na zoznam
        </Group>
      </Anchor>

      <Title>Nový tréning</Title>

      {error && <ErrorAlert error={error} title="Vytvorenie tréningu zlyhalo" />}

      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Dátum"
                type="date"
                withAsterisk
                key={form.key('date')}
                {...form.getInputProps('date')}
              />
              <Select
                label="Typ"
                withAsterisk
                placeholder="Vyberte typ"
                data={typeOptions}
                allowDeselect={false}
                key={form.key('type')}
                {...form.getInputProps('type')}
              />
            </SimpleGrid>

            <Group justify="flex-end" mt="sm">
              <Button component={Link} to="/trainings" variant="default" disabled={saving}>
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

export default NewTrainingPage;
