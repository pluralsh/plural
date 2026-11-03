import {
  Button,
  CheckRoundedIcon,
  CircleDashIcon,
  SidePanelOpenIcon,
} from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { InProgressIcon } from './InProgressIcon'
import { SetupGuidePanel } from './SetupGuidePanel'
import { FormCardSC } from './shared'
import { SupportCard } from './SupportCard'

export type SetupStepStatus = 'complete' | 'in-progress' | 'pending'

export type SetupStep<K extends string> = {
  key: K
  label: string
  status: SetupStepStatus
  reachable: boolean
}

export function SetupFlowLayout<K extends string>({
  title,
  subtitle,
  navLabel,
  steps,
  curStep,
  onStepChange,
  guideOpen,
  setGuideOpen,
  banner,
  children,
}: {
  title: string
  subtitle?: string
  navLabel: string
  steps: SetupStep<K>[]
  curStep: K
  onStepChange: (step: K) => void
  guideOpen: boolean
  setGuideOpen: (open: boolean) => void
  banner?: ReactNode
  children: ReactNode
}) {
  return (
    <PageSC>
      <MainSC>
        <ContentSC>
          <ColumnSC>
            <HeaderSC>
              <div className="copy">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
              {!guideOpen && (
                <Button
                  secondary
                  startIcon={<SidePanelOpenIcon />}
                  onClick={() => setGuideOpen(true)}
                  css={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  Setup guide
                </Button>
              )}
            </HeaderSC>
            <SplitSC>
              <StepNavSC aria-label={navLabel}>
                {steps.map(({ key, label, status, reachable }) => (
                  <StepButtonSC
                    key={key}
                    type="button"
                    $active={curStep === key}
                    aria-current={curStep === key ? 'step' : undefined}
                    disabled={!reachable && curStep !== key}
                    onClick={() => onStepChange(key)}
                  >
                    {label}
                    <StepStatusIcon status={status} />
                  </StepButtonSC>
                ))}
                <SupportCard />
              </StepNavSC>
              <FormCardSC>
                {banner}
                {children}
              </FormCardSC>
            </SplitSC>
          </ColumnSC>
        </ContentSC>
      </MainSC>
      {guideOpen && <SetupGuidePanel onClose={() => setGuideOpen(false)} />}
    </PageSC>
  )
}

function StepStatusIcon({ status }: { status: SetupStepStatus }) {
  if (status === 'complete')
    return (
      <CheckRoundedIcon
        color="icon-success"
        size={16}
      />
    )

  if (status === 'in-progress') return <InProgressIcon />

  return (
    <CircleDashIcon
      color="icon-light"
      size={16}
    />
  )
}

const PageSC = styled.div({
  display: 'flex',
  height: '100%',
  minHeight: 0,
})

const MainSC = styled.div({
  flex: 1,
  minWidth: 0,
  overflow: 'auto',
})

const ContentSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
}))

const ColumnSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  flex: 1,
  minWidth: 0,
  maxWidth: 1008,
  marginInline: 'auto',
}))

const HeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  '.copy': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xxsmall,
    minWidth: 0,
  },
  h2: {
    ...theme.partials.text.subtitle1,
    color: theme.colors.text,
    margin: 0,
  },
  p: {
    ...theme.partials.text.body1,
    color: theme.colors['text-xlight'],
    margin: 0,
  },
}))

const SplitSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing.medium,
  minWidth: 0,
}))

const StepNavSC = styled.nav(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xxxsmall,
  width: 240,
  flexShrink: 0,
}))

const StepButtonSC = styled.button<{ $active: boolean }>(
  ({ theme, $active }) => ({
    ...theme.partials.text.body2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xsmall,
    minHeight: 40,
    padding: theme.spacing.xsmall,
    whiteSpace: 'nowrap',
    textAlign: 'left',
    cursor: 'pointer',
    border: 'none',
    borderRadius: theme.borderRadiuses.medium,
    color: theme.colors.text,
    backgroundColor: $active
      ? theme.colors['fill-one-selected']
      : 'transparent',
    '&:hover:not(:disabled)': {
      backgroundColor: $active
        ? theme.colors['fill-one-selected']
        : theme.colors['fill-zero-hover'],
    },
    '&:disabled': { cursor: 'default', color: theme.colors['text-light'] },
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
  })
)
