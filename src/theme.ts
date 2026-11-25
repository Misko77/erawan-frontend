import { createTheme, Table, TextInput, type CSSVariablesResolver } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  components: {
    Table: Table.extend({
      // Light theme: violet-tinted stripes (Mantine's gray-0 is barely visible on white). Dark keeps Mantine defaults.
      vars: () => ({
        table: {
          '--table-striped-color': 'light-dark(var(--mantine-color-violet-1), var(--mantine-color-dark-6))',
          '--table-hover-color': 'light-dark(var(--mantine-color-violet-2), var(--mantine-color-dark-5))',
        },
      }),
    }),
    // Read-only inputs look like static values, not editable fields: darker/recessed background,
    // dashed border, dimmed text. Most noticeable in dark theme where inputs otherwise look identical.
    TextInput: TextInput.extend({
      styles: (_theme, props) =>
        props.readOnly
          ? {
              input: {
                backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
                borderStyle: 'dashed',
                color: 'var(--mantine-color-dimmed)',
                cursor: 'default',
              },
            }
          : {},
    }),
  },
})

/**
 * Light theme: muted gray background instead of pure white (easier on the eyes).
 * `--mantine-color-body` is also used by Paper, Modal and AppShell header/navbar. Dark theme unchanged.
 */
export const cssVariablesResolver: CSSVariablesResolver = (t) => ({
  variables: {},
  light: {
    '--mantine-color-body': t.colors.gray[1],
  },
  dark: {},
})
