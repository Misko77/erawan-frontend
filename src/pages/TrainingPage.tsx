import { ActionIcon, Anchor, Badge, Button, Center, Checkbox, Group, Loader, Modal, Paper, Popover, ScrollArea, SimpleGrid, Stack, Table, Text, TextInput, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconSearch, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
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

/** Modal body; mounted only while the modal is open, so members reload and selection resets on each open. */
function AddMembersModalContent({
  trainingId,
  attendees,
  onSaved,
  onCancel,
}: {
  trainingId: string | number;
  attendees: Member[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { data: allMembers, error: loadError, reload } = useApi(getMembers, []);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error>();

  const attendeeIds = new Set(attendees.map((m) => m.id));
  const candidates = (allMembers ?? [])
    .filter((m) => m.isActive && !attendeeIds.has(m.id))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'sk') || a.name.localeCompare(b.name, 'sk'));
  const query = search.trim().toLocaleLowerCase('sk');
  const visible = query
    ? candidates.filter((m) => `${m.lastName} ${m.name}`.toLocaleLowerCase('sk').includes(query))
    : candidates;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    setSaveError(undefined);
    try {
      // PUT replaces the whole list, so send existing attendees + the new ones
      await setTrainingMembers(trainingId, [...attendeeIds, ...selected]);
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e : new Error(String(e)));
      setSaving(false);
    }
  };

  return (
    <Stack gap="sm">
      {loadError && <ErrorAlert error={loadError} onRetry={reload} />}
      {saveError && <ErrorAlert error={saveError} title="Uloženie zlyhalo" />}

      {!allMembers ? (
        !loadError && (
          <Center py="lg">
            <Loader size="sm" />
          </Center>
        )
      ) : candidates.length === 0 ? (
        <Text c="dimmed" ta="center" py="md">Všetci aktívni členovia sú pridaní</Text>
      ) : (
        <>
          <TextInput
            placeholder="Vyhľadať člena"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            data-autofocus
          />
          <ScrollArea.Autosize mah={{ base: 'calc(100dvh - 220px)', sm: '50vh' }} type="auto">
            <Stack gap={4}>
              {visible.length > 0 ? (
                visible.map((m) => (
                  <Checkbox
                    key={m.id}
                    label={`${m.lastName} ${m.name}`}
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    disabled={saving}
                    p="xs"
                  />
                ))
              ) : (
                <Text c="dimmed" ta="center" py="md">Nenašiel sa žiadny člen</Text>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </>
      )}

      <Group justify="flex-end" mt="sm">
        <Button variant="default" onClick={onCancel} disabled={saving}>
          Zrušiť
        </Button>
        <Button
          leftSection={<IconUserPlus size={16} />}
          onClick={handleSave}
          loading={saving}
          disabled={selected.size === 0}
        >
          Pridať{selected.size > 0 ? ` (${selected.size})` : ''}
        </Button>
      </Group>
    </Stack>
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
  const [addOpened, setAddOpened] = useState(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
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
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <Title order={2}>Účastníci</Title>
          {members && (
            <Badge variant="light" size="lg">
              {members.length}
            </Badge>
          )}
        </Group>
        {members && (
          <Button leftSection={<IconUserPlus size={16} />} onClick={() => setAddOpened(true)}>
            Pridať účastníkov
          </Button>
        )}
      </Group>

      <Modal
        opened={addOpened}
        onClose={() => setAddOpened(false)}
        title="Pridať účastníkov"
        fullScreen={isMobile}
        transitionProps={isMobile ? { transition: 'slide-up' } : undefined}
      >
        {members && (
          <AddMembersModalContent
            trainingId={trainingId}
            attendees={members}
            onCancel={() => setAddOpened(false)}
            onSaved={() => {
              setAddOpened(false);
              reload();
            }}
          />
        )}
      </Modal>

      {error && <ErrorAlert error={error} onRetry={reload} />}
      {removeError && <ErrorAlert error={removeError} title="Odobratie zlyhalo" />}

      {loading && !members ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : members && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={320}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Meno</Table.Th>
                  <Table.Th>Priezvisko</Table.Th>
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
                    <Table.Td colSpan={3}>
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
