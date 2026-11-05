import { Anchor, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router'

function NotFound() {
  return (
    <Stack align="center" py="xl">
      <Title order={2}>Page not found</Title>
      <Text>
        <Anchor component={Link} to="/">
          Go back home
        </Anchor>
      </Text>
    </Stack>
  )
}

export default NotFound
