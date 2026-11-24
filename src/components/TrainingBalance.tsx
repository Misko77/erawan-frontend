import { Badge, type BadgeProps } from '@mantine/core'

/** Color for a trainings-left balance: debt red, zero yellow, credit teal. */
function balanceColor(count: number) {
  return count < 0 ? 'red' : count === 0 ? 'yellow' : 'teal'
}

type TrainingBalanceBadgeProps = {
  count: number
  label?: string
  size?: BadgeProps['size']
}

/** One balance badge, optionally prefixed with a label ("Skupinové: 3"). */
export function TrainingBalanceBadge({ count, label, size }: TrainingBalanceBadgeProps) {
  return (
    <Badge variant="light" color={balanceColor(count)} size={size}>
      {label ? `${label}: ${count}` : count}
    </Badge>
  )
}

type TrainingBalanceBadgesProps = {
  groupCount: number
  privateCount: number
  size?: BadgeProps['size']
  groupLabel?: string
  privateLabel?: string
}

/** Group and private balance badges side by side (the caller supplies the layout container). */
export function TrainingBalanceBadges({
  groupCount,
  privateCount,
  size,
  groupLabel = 'Skupinové',
  privateLabel = 'Súkromné',
}: TrainingBalanceBadgesProps) {
  return (
    <>
      <TrainingBalanceBadge count={groupCount} label={groupLabel} size={size} />
      <TrainingBalanceBadge count={privateCount} label={privateLabel} size={size} />
    </>
  )
}
