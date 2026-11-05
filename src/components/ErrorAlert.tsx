import { Alert, Button, Group, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

type Props = {
  error: Error
  onRetry?: () => void
  title?: string
}

function ErrorAlert({ error, onRetry, title = 'Nepodarilo sa načítať dáta' }: Props) {
  return (
    <Alert color="red" variant="light" title={title} icon={<IconAlertTriangle />}>
      <Group justify="space-between" align="center">
        <Text size="sm">{error.message}</Text>
        {onRetry && (
          <Button size="xs" variant="light" color="red" onClick={onRetry}>
            Skúsiť znova
          </Button>
        )}
      </Group>
    </Alert>
  )
}

export default ErrorAlert
