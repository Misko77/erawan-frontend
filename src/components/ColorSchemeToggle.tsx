import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme, type ActionIconProps } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'

/** Switches between light and dark theme; Mantine persists the choice in localStorage. */
function ColorSchemeToggle(props: ActionIconProps) {
  const { setColorScheme } = useMantineColorScheme()
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const label = computed === 'dark' ? 'Svetlá téma' : 'Tmavá téma'

  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="default"
        size="lg"
        aria-label={label}
        onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
        {...props}
      >
        {computed === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
      </ActionIcon>
    </Tooltip>
  )
}

export default ColorSchemeToggle
