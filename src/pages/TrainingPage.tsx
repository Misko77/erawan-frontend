import { ActionIcon, Anchor, Badge, Button, Center, Group, Loader, MultiSelect, Paper, Popover, SimpleGrid, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client.ts';
import { getMembers, type Member } from '../api/members.ts';
import { getTraining, getTrainingMembers, setTrainingMembers, trainingTypeColors, trainingTypeLabels } from '../api/trainings.ts';
import { useApi } from '../api/useApi.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';
import { formatDate, formatDateTime } from '../utils/format.ts';

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

function AddMembersForm({
  trainingId,
  attendees,
  onSaved,
}: {
  trainingId: string | number;
  attendees: Member[];
  onSaved: () => void;
}) {
  const { data: allMembers, error: loadError, reload } = useApi(getMembers, []);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error>();

  const attendeeIds = new Set(attendees.map((m) => m.id));
  const options = (allMembers ?? [])
    .filter((m) => m.isActive && !attendeeIds.has(m.id))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'sk') || a.name.localeCompare(b.name, 'sk'))
    .map((m) => ({ value: String(m.id), label: `${m.lastName} ${m.name}` }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(undefined);
    try {
      // PUT replaces the whole list, so send existing attendees + the new ones
      await setTrainingMembers(trainingId, [...attendeeIds, ...selected.map(Number)]);
      setSelected([]);
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
      <Stack gap="sm">
        {loadError && <ErrorAlert error={loadError} onRetry={reload} />}
        {saveError && <ErrorAlert error={saveError} title="Uloženie zlyhalo" />}
        <Group align="flex-end" gap="sm">
          <MultiSelect
            label="Pridať účastníkov"
            placeholder={allMembers ? (options.length > 0 ? 'Vyhľadať člena' : 'Všetci aktívni členovia sú pridaní') : 'Načítavam…'}
            data={options}
            value={selected}
            onChange={setSelected}
            searchable
            clearable
            hidePickedOptions
            nothingFoundMessage="Nenašiel sa žiadny člen"
            disabled={!allMembers || options.length === 0 || saving}
            style={{ flex: 1, minWidth: 240 }}
          />
          <Button
            leftSection={<IconUserPlus size={16} />}
            onClick={handleSave}
            loading={saving}
            disabled={selected.length === 0}
          >
            Uložiť
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

function RemoveMemberButton({ member, onConfirm }: { member: Member; onConfirm: () => void }) {
  const [opened, setOpened] = useState(false);
  const fullName = `${member.name} ${member.lastName}`;

  return (
    <Popover opened={opened} onChange={setOpened} position="left" withArrow shadow="md">
      <Popover.Target>
        <Tooltip label="Odobrať z tréningu" disabled={opened}>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={'Odobrať ' + fullName}
            onClick={() => setOpened((o) => !o)}
          >
            <IconUserMinus size={18} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Text size="sm">
            Odobrať <b>{fullName}</b> z tréningu?
          </Text>
          <Group gap="xs" justify="flex-end">
            <Button size="xs" variant="default" onClick={() => setOpened(false)}>
              Zrušiť
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => {
                setOpened(false);
                onConfirm();
              }}
            >
              Odobrať
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

function TrainingMembers({ trainingId }: { trainingId: string | number }) {
  const navigate = useNavigate();
  const { data: members, error, loading, reload } = useApi(
    (signal) => getTrainingMembers(trainingId, signal),
    [trainingId],
  );
  const [removingId, setRemovingId] = useState<number>();
  const [removeError, setRemoveError] = useState<Error>();

  const removeMember = async (memberId: number) => {
    if (!members) return;
    setRemovingId(memberId);
    setRemoveError(undefined);
    try {
      // PUT replaces the whole list, so send everyone except the removed member
      await setTrainingMembers(trainingId, members.filter((m) => m.id !== memberId).map((m) => m.id));
      reload();
    } catch (e) {
      setRemoveError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setRemovingId(undefined);
    }
  };

  return (
    <Stack gap="sm">
      <Group gap="sm" align="center">
        <Title order={2}>Účastníci</Title>
        {members && (
          <Badge variant="light" size="lg">
            {members.length}
          </Badge>
        )}
      </Group>

      {members && <AddMembersForm trainingId={trainingId} attendees={members} onSaved={reload} />}

      {error && <ErrorAlert error={error} onRetry={reload} />}
      {removeError && <ErrorAlert error={removeError} title="Odobratie zlyhalo" />}

      {loading && !members ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : members && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={480}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Meno</Table.Th>
                  <Table.Th>Priezvisko</Table.Th>
                  <Table.Th>Telefón</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th w={1} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {members.length > 0 ? (
                  members.map((member) => (
                    <Table.Tr
                      key={member.id}
                      onClick={() => navigate('/members/' + member.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate('/members/' + member.id);
                      }}
                      tabIndex={0}
                      aria-label={'Detail: ' + member.name + ' ' + member.lastName}
                      style={{ cursor: 'pointer' }}
                    >
                      <Table.Td>{member.name}</Table.Td>
                      <Table.Td>{member.lastName}</Table.Td>
                      <Table.Td>{member.phone ?? '—'}</Table.Td>
                      <Table.Td>{member.email ?? '—'}</Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        {removingId === member.id ? (
                          <Loader size="xs" color="red" m={6} />
                        ) : (
                          <RemoveMemberButton member={member} onConfirm={() => removeMember(member.id)} />
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">Žiadni účastníci</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Stack>
  );
}

function TrainingPage() {
  const { id = '' } = useParams();
  const { data: training, error, loading, reload } = useApi((signal) => getTraining(id, signal), [id]);

  const backLink = (
    <Anchor component={Link} to="/trainings" size="sm">
      <Group gap={4}>
        <IconChevronLeft size={16} />
        Späť na zoznam
      </Group>
    </Anchor>
  );

  if (loading && !training) {
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
        <Title order={2}>Tréning nenájdený</Title>
      </Stack>
    );
  }

  if (error || !training) {
    return (
      <Stack gap="lg">
        {backLink}
        {error && <ErrorAlert error={error} onRetry={reload} />}
      </Stack>
    );
  }

  const typeLabel = trainingTypeLabels[training.type] ?? training.type;

  return (
    <Stack gap="lg">
      {backLink}
      <Group gap="sm" align="center">
        <Title>Tréning {formatDate(training.date)}</Title>
        <Badge variant="light" size="lg" color={trainingTypeColors[training.type] ?? 'gray'}>
          {typeLabel}
        </Badge>
      </Group>
      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Field label="Id" value={training.id} />
          <Field label="Dátum" value={formatDate(training.date)} />
          <Field label="Typ" value={typeLabel} />
          <Field label="Vytvoril" value={training.createdBy} />
          <Field label="Vytvorený" value={formatDateTime(training.createdAt)} />
          <Field label="Upravený" value={formatDateTime(training.updatedAt)} />
        </SimpleGrid>
      </Paper>

      <TrainingMembers trainingId={training.id} />
    </Stack>
  );
}

export default TrainingPage;
