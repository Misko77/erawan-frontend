import { Anchor, Center, Group, Loader, Stack, Title } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client.ts';
import { getMember, updateMember, type UpdateMemberRequest } from '../api/members.ts';
import { useApi } from '../api/useApi.ts';
import ErrorAlert from '../components/ErrorAlert.tsx';
import MemberForm from '../components/MemberForm.tsx';

function EditMemberPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: member, error: loadError, loading, reload } = useApi((signal) => getMember(id, signal), [id]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error>();

  const memberPath = `/members/${encodeURIComponent(id)}`;

  const handleSubmit = async (request: UpdateMemberRequest) => {
    setSaving(true);
    setError(undefined);
    try {
      await updateMember(id, request);
      navigate(memberPath, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSaving(false);
    }
  };

  const backLink = (
    <Anchor component={Link} to={memberPath} size="sm">
      <Group gap={4}>
        <IconChevronLeft size={16} />
        Späť na člena
      </Group>
    </Anchor>
  );

  let content;
  if (loading && !member) {
    content = (
      <Center py="xl">
        <Loader />
      </Center>
    );
  } else if (loadError instanceof ApiError && loadError.status === 404) {
    content = <Title order={2}>Člen nenájdený</Title>;
  } else if (loadError || !member) {
    content = loadError && <ErrorAlert error={loadError} onRetry={reload} />;
  } else {
    content = (
      <>
        <Title>
          Upraviť člena: {member.name} {member.lastName}
        </Title>
        {error && <ErrorAlert error={error} title="Uloženie člena zlyhalo" />}
        <MemberForm
          key={member.id}
          member={member}
          submitLabel="Uložiť"
          cancelTo={memberPath}
          saving={saving}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <Stack gap="lg" maw={720}>
      {backLink}
      {content}
    </Stack>
  );
}

export default EditMemberPage;
