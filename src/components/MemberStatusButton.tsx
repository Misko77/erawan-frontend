import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { useState } from 'react'
import { activateMember, deactivateMember, type Member } from '../api/members.ts'
import ErrorAlert from './ErrorAlert.tsx'

type Props = {
  member: Member
  /** Called after the status was changed on the server */
  onChanged: () => void
}

function MemberStatusButton({ member, onChanged }: Props) {
  const [confirmOpened, confirm] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error>()

  const run = async (action: () => Promise<unknown>) => {
    setSaving(true)
    setError(undefined)
    try {
      await action()
      confirm.close()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setSaving(false)
    }
  }

  const fullName = `${member.name} ${member.lastName}`

  return (
    <Stack gap="xs" align="flex-end">
      {member.isActive ? (
        <Button
          color="red"
          variant="light"
          leftSection={<IconPlayerPause size={16} />}
          onClick={() => {
            setError(undefined)
            confirm.open()
          }}
        >
          Deaktivovať
        </Button>
      ) : (
        <Button
          color="teal"
          variant="light"
          leftSection={<IconPlayerPlay size={16} />}
          loading={saving}
          onClick={() => run(() => activateMember(member.id))}
        >
          Aktivovať
        </Button>
      )}

      {error && !confirmOpened && <ErrorAlert error={error} title="Zmena stavu zlyhala" />}

      <Modal opened={confirmOpened} onClose={confirm.close} title="Deaktivovať člena" centered>
        <Stack>
          <Text>
            Naozaj chcete deaktivovať člena <b>{fullName}</b>?
          </Text>
          {error && <ErrorAlert error={error} title="Zmena stavu zlyhala" />}
          <Group justify="flex-end">
            <Button variant="default" onClick={confirm.close} disabled={saving}>
              Zrušiť
            </Button>
            <Button color="red" loading={saving} onClick={() => run(() => deactivateMember(member.id))}>
              Deaktivovať
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

export default MemberStatusButton
