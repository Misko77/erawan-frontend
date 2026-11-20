import { Anchor, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router'

function NotFound() {
  return (
    <Stack align="center" py="xl">
      <Title order={2}>Stránka sa nenašla</Title>
      <Text>
        <Anchor component={Link} to="/">
          Späť na úvod
        </Anchor>
      </Text>
    </Stack>
  )
}

export default NotFound
