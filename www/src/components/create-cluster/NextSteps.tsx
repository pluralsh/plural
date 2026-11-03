import {
  CaretRightIcon,
  Chip,
  Codeline,
  InfoOutlineIcon,
} from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { toneMix } from '../utils/tone'

import { BodyTextSC } from './shared'

export function NextStepsHero({
  title,
  adornment,
  description,
}: {
  title: string
  adornment?: ReactNode
  description: string
}) {
  return (
    <HeroSC>
      <div className="titleRow">
        <span className="title">{title}</span>
        {adornment}
      </div>
      <BodyTextSC>{description}</BodyTextSC>
    </HeroSC>
  )
}

export function LabeledCodeline({
  label,
  children,
}: {
  label: string
  children: string
}) {
  return (
    <LabeledBoxSC>
      <span className="label">{label}</span>
      <CodelineSC>{children}</CodelineSC>
    </LabeledBoxSC>
  )
}

export const NumberedStepsSC = styled.ol({
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export function NumberedStep({
  number,
  title,
  active = false,
  last = false,
  children,
}: {
  number: number
  title: string
  active?: boolean
  last?: boolean
  children: ReactNode
}) {
  return (
    <StepSC>
      <div className="spine">
        <StepNumberSC $active={active}>{number}</StepNumberSC>
        {!last && <div className="connector" />}
      </div>
      <div className="body">
        <span className="title">{title}</span>
        {children}
      </div>
    </StepSC>
  )
}

export function NavPath({ segments }: { segments: string[] }) {
  return (
    <PathSC aria-label={segments.join(', then ')}>
      {segments.map((segment, i) => (
        <span
          key={segment}
          className="segment"
        >
          {i > 0 && (
            <CaretRightIcon
              size={10}
              color="icon-xlight"
            />
          )}
          <Chip size="large">{segment}</Chip>
        </span>
      ))}
    </PathSC>
  )
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <NoteSC>
      <InfoOutlineIcon
        color="icon-info"
        size={16}
      />
      <span>{children}</span>
    </NoteSC>
  )
}

const HeroSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xxsmall,
  minWidth: 0,
  '.titleRow': {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  '.title': { ...theme.partials.text.subtitle1, color: theme.colors.text },
}))

const LabeledBoxSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,
  paddingLeft: theme.spacing.medium,
  borderRadius: theme.borderRadiuses.medium,
  border: theme.borders.input,
  backgroundColor: theme.colors['fill-zero'],
  '.label': {
    ...theme.partials.text.body2,
    flexShrink: 0,
    color: theme.colors['text-xlight'],
  },
}))

const CodelineSC = styled(Codeline)({
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
  border: 'none',
  background: 'transparent',
})

const StepSC = styled.li(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.medium,
  '.spine': {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
    width: 32,
  },
  '.connector': {
    position: 'absolute',
    top: 32,
    bottom: 0,
    left: '50%',
    width: 1,
    transform: 'translateX(-50%)',
    background: theme.colors.border,
  },
  '.body': {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: theme.spacing.small,
    minWidth: 0,
    paddingTop: 4,
    paddingBottom: theme.spacing.large,
  },
  '&:last-child .body': { paddingBottom: 0 },
  '.title': { ...theme.partials.text.body1Bold, color: theme.colors.text },
  strong: { ...theme.partials.text.body2Bold, color: theme.colors.text },
}))

const StepNumberSC = styled.span<{ $active: boolean }>(
  ({ theme, $active }) => ({
    ...theme.partials.text.caption,
    fontWeight: 600,
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    color: theme.colors.text,
    border: $active ? 'none' : theme.borders.input,
    backgroundColor: $active
      ? theme.colors['fill-three']
      : theme.colors['fill-one'],
  })
)

const PathSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing.xsmall,
  '.segment': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xsmall,
  },
}))

const NoteSC = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing.small,
  padding: theme.spacing.medium,
  borderRadius: theme.borderRadiuses.medium,
  border: `1px solid ${toneMix(theme, 'border-info', 40)}`,
  backgroundColor: toneMix(theme, 'border-info', 12),
  color: theme.colors['text-light'],
  svg: { flexShrink: 0, marginTop: 2 },
}))
