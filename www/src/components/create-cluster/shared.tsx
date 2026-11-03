import { Card, FormField } from '@pluralsh/design-system'
import styled from 'styled-components'

export const FormFieldSC = styled(FormField)(({ theme }) => ({
  color: theme.colors.text,
}))

export const FormCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.medium,
  padding: theme.spacing.xlarge,
  paddingBottom: 0,
  flex: 1,
  minWidth: 0,
  maxWidth: 750,
}))

export const OverlineSC = styled.h4(({ theme }) => ({
  ...theme.partials.text.overline,
  color: theme.colors['text-xlight'],
  margin: 0,
}))

export const SectionLabelSC = styled.h3(({ theme }) => ({
  ...theme.partials.text.body1Bold,
  color: theme.colors.text,
  margin: 0,
}))

export const SubCardSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders['fill-two'],
  backgroundColor: theme.colors['fill-zero'],
}))

export const BodyTextSC = styled.p(({ theme }) => ({
  ...theme.partials.text.body2,
  color: theme.colors['text-light'],
  margin: 0,
}))

export const SegmentedSC = styled.div<{ $count?: number }>(
  ({ theme, $count = 3 }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${$count}, 1fr)`,
    gap: theme.spacing.xsmall,
  })
)

export const SegmentSC = styled.button<{ $selected: boolean }>(
  ({ theme, $selected }) => ({
    ...theme.partials.text.body2Bold,
    width: '100%',
    height: 40,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderRadius: theme.borderRadiuses.medium,
    color: theme.colors.text,
    border: $selected
      ? `1px solid ${theme.colors['border-selected']}`
      : theme.borders.input,
    backgroundColor: $selected
      ? theme.colors['fill-two-selected']
      : 'transparent',
    '&:hover': {
      backgroundColor: $selected
        ? theme.colors['fill-two-selected']
        : theme.colors['fill-zero-hover'],
    },
    '&[aria-disabled]': {
      cursor: 'not-allowed',
      color: theme.colors['text-input-disabled'],
      '&:hover': { backgroundColor: 'transparent' },
    },
  })
)

export const InlineCodeSC = styled.code(({ theme }) => ({
  ...theme.partials.text.code,
  fontSize: 12,
  padding: '1px 4px',
  borderRadius: theme.borderRadiuses.medium,
  border: theme.borders['fill-two'],
  backgroundColor: theme.colors['fill-two'],
  color: theme.colors.text,
  whiteSpace: 'nowrap',
}))

export const RadioSC = styled.span<{ $selected: boolean }>(
  ({ theme, $selected }) => ({
    flexShrink: 0,
    width: 16,
    height: 16,
    marginTop: 3,
    borderRadius: '50%',
    border: `1px solid ${
      $selected ? theme.colors['action-primary'] : theme.colors['border-input']
    }`,
    background: $selected
      ? `radial-gradient(circle, ${theme.colors['action-primary']} 0 4px, transparent 4.5px)`
      : undefined,
  })
)
