import { Button, Group, NumberInput, Paper, Select, SimpleGrid, Stack, Title } from '@mantine/core'
import { isInRange, isNotEmpty, useForm } from '@mantine/form'
import { IconDownload } from '@tabler/icons-react'
import { useState } from 'react'
import { exportMonth } from '../api/analytics.ts'
import { saveBlob } from '../api/client.ts'
import ErrorAlert from '../components/ErrorAlert.tsx'

const monthOptions = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December',
].map((label, i) => ({ value: String(i + 1), label }))

type FormValues = {
  year: number | string
  month: string | null
}

// Computed once at module load: the current month is the sensible default
const today = new Date()
const defaultPeriod: FormValues = { year: today.getFullYear(), month: String(today.getMonth() + 1) }

function ExportPage() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<Error>()

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: defaultPeriod,
    validateInputOnBlur: true,
    validate: {
      year: isInRange({ min: 2000, max: 2100 }, 'Zadajte platný rok'),
      month: isNotEmpty('Vyberte mesiac'),
    },
  })

  const handleSubmit = async (values: FormValues) => {
    const year = Number(values.year)
    const month = Number(values.month)
    setDownloading(true)
    setError(undefined)
    try {
      const { blob, fileName } = await exportMonth(year, month)
      saveBlob(blob, fileName ?? `export-${year}-${String(month).padStart(2, '0')}.xlsx`)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Stack gap="lg" maw={720}>
      <Title>Export</Title>

      {error && <ErrorAlert error={error} title="Export zlyhal" />}

      <Paper withBorder shadow="xs" radius="md" p={{ base: 'md', sm: 'lg' }}>
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <NumberInput
                label="Rok"
                withAsterisk
                min={2000}
                max={2100}
                allowDecimal={false}
                allowNegative={false}
                key={form.key('year')}
                {...form.getInputProps('year')}
              />
              <Select
                label="Mesiac"
                withAsterisk
                placeholder="Vyberte mesiac"
                data={monthOptions}
                allowDeselect={false}
                key={form.key('month')}
                {...form.getInputProps('month')}
              />
            </SimpleGrid>

            <Group justify="flex-end" mt="sm">
              <Button type="submit" loading={downloading} leftSection={<IconDownload size={16} />}>
                Stiahnuť XLSX
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}

export default ExportPage
