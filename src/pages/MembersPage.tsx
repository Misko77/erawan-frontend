import { Button, Center, Group, Loader, Paper, SegmentedControl, Stack, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from "react-router";
import { getMembers } from '../api/members.ts';
import { useApi } from '../api/useApi.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';

type StatusFilter = 'active' | 'inactive' | 'all';

const statusFilters: { value: StatusFilter; label: string; empty: string }[] = [
  { value: 'active', label: 'Aktívni', empty: 'Žiadni aktívni členovia' },
  { value: 'inactive', label: 'Neaktívni', empty: 'Žiadni neaktívni členovia' },
  { value: 'all', label: 'Všetci', empty: 'Žiadni členovia' },
];

const DEFAULT_FILTER: StatusFilter = 'active';

function MembersPage() {
  const { data: members, error, loading, reload } = useApi(getMembers, []);
  const navigate = useNavigate();

  // Filter lives in the URL (?stav=...) so it survives navigating to a member and back
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('stav');
  const filter = statusFilters.find((f) => f.value === filterParam) ?? statusFilters.find((f) => f.value === DEFAULT_FILTER)!;

  const setFilter = (value: string) => {
    setSearchParams(
      (params) => {
        if (value === DEFAULT_FILTER) params.delete('stav');
        else params.set('stav', value);
        return params;
      },
      { replace: true },
    );
  };

  const filteredMembers = (members ?? []).filter((member) =>
    filter.value === 'all' ? true : filter.value === 'active' ? member.isActive : !member.isActive,
  );

  const rows = filteredMembers.map((member) => (
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
      <Table.Td>{member.id}</Table.Td>
      <Table.Td>{member.name}</Table.Td>
      <Table.Td>{member.lastName}</Table.Td>
      <Table.Td>
        {member.isActive ? (
          <ThemeIcon color="teal" variant="light" size="sm" radius="xl" aria-label="Aktívny">
            <IconCheck size={14} stroke={3} />
          </ThemeIcon>
        ) : (
          <ThemeIcon color="red" variant="light" size="sm" radius="xl" aria-label="Neaktívny">
            <IconX size={14} stroke={3} />
          </ThemeIcon>
        )}
      </Table.Td>
      <Table.Td>{member.phone ?? '—'}</Table.Td>
      <Table.Td>{member.email ?? '—'}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title>Koblížkovia</Title>
        <Button component={Link} to="/members/new" leftSection={<IconPlus size={16} />}>
          Nový koblížek
        </Button>
      </Group>

      <SegmentedControl
        value={filter.value}
        onChange={setFilter}
        data={statusFilters.map(({ value, label }) => ({ value, label }))}
        w={{ base: '100%', xs: 'auto' }}
        style={{ alignSelf: 'flex-start' }}
      />

      {error && <ErrorAlert error={error} onRetry={reload} />}

      {loading && !members ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : members && (
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={640}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Id</Table.Th>
                  <Table.Th>Meno</Table.Th>
                  <Table.Th>Priezvisko</Table.Th>
                  <Table.Th>Aktivny</Table.Th>
                  <Table.Th>Telefon</Table.Th>
                  <Table.Th>Email</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed" ta="center" py="md">{filter.empty}</Text>
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

export default MembersPage
