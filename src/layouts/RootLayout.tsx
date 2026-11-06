import { AppShell, Burger, Button, Group, Image, NavLink, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link, Outlet, useLocation } from 'react-router'
import logo from '../assets/logo.jpeg'
import { useAuth } from '../auth/useAuth.ts'

const menuItems = [
  { to: '/', label: 'Koblížkovia' },
  { to: '/payments', label: 'Platby' },
  { to: '/trainings', label: 'Tréningy' },
  { to: '/totals', label: 'Neplatiči' },
]

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

function RootLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [opened, { toggle, close }] = useDisclosure(false)

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label={opened ? 'Close menu' : 'Open menu'}
            />
            {user && (
              <Link to="/" onClick={close} style={{ display: 'flex' }}>
                <Image src={logo} alt="Logo" h={40} w="auto" fit="contain" />
              </Link>
            )}
            <Group gap={4} visibleFrom="sm">
              {menuItems.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  variant={isActive(pathname, item.to) ? 'light' : 'subtle'}
                  color={isActive(pathname, item.to) ? undefined : 'gray'}
                >
                  {item.label}
                </Button>
              ))}
            </Group>
          </Group>

          {user && (
            <Group gap="sm" wrap="nowrap" visibleFrom="sm">
              <Text size="sm">{user.name}</Text>
              <Button variant="default" size="xs" onClick={logout}>
                Log out
              </Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {/* Mobile-only drawer menu (collapsed on desktop, links are in the header there) */}
      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap={4}>
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                active={isActive(pathname, item.to)}
                onClick={close}
              />
            ))}
          </Stack>

          {user && (
            <Group justify="space-between">
              <Text size="sm">{user.name}</Text>
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  close()
                  logout()
                }}
              >
                Log out
              </Button>
            </Group>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default RootLayout
