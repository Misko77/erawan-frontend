import { Anchor, Group, Stack, Title } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createMember, type CreateMemberRequest } from '../api/members.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';
import MemberForm from '../components/MemberForm.tsx';

function NewMemberPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error>();

  const handleSubmit = async (request: CreateMemberRequest) => {
    setSaving(true);
    setError(undefined);
    try {
      const created = await createMember(request);
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

      <MemberForm submitLabel="Vytvoriť" cancelTo="/" saving={saving} onSubmit={handleSubmit} />
    </Stack>
  );
}

export default NewMemberPage;
