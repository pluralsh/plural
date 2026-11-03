import { Card } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

import { Tone, toneMix } from './tone'

export function PageHeader({
  title,
  children,
}: {
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <PageHeaderSC>
      <h1>{title}</h1>
      {children && <div className="actions">{children}</div>}
    </PageHeaderSC>
  )
}

export type ProductFeature = {
  icon: ReactNode
  title: string
  description: string
}

export function ProductEmptyState({
  tone,
  illustration,
  title,
  description,
  actions,
  features,
  children,
}: {
  tone: Tone
  illustration: ReactNode
  title: string
  description: string
  actions: ReactNode
  features: ProductFeature[]
  children?: ReactNode
}) {
  return (
    <WrapperSC>
      <HeroSC $tone={tone}>
        <IllustrationSC>{illustration}</IllustrationSC>
        <div className="copy">
          <h2>{title}</h2>
          <p>
            {description.split(/(?<=\.)\s+/).map((sentence) => (
              <span key={sentence}>{sentence}</span>
            ))}
          </p>
          <div className="actions">{actions}</div>
        </div>
      </HeroSC>
      <FeaturesSC $count={features.length}>
        {features.map(({ icon, title, description }) => (
          <FeatureCardSC key={title}>
            <IconTile
              $tone={tone}
              $size={32}
            >
              {icon}
            </IconTile>
            <h3>{title}</h3>
            <p>{description}</p>
          </FeatureCardSC>
        ))}
      </FeaturesSC>
      {children}
    </WrapperSC>
  )
}

export function MockCard({
  tone,
  title,
  status,
  faded,
  children,
}: {
  tone: Tone
  title: string
  status?: string
  faded?: boolean
  children?: ReactNode
}) {
  const theme = useTheme()

  return (
    <MockCardSC $faded={!!faded}>
      <div className="header">
        <span className="title">{title}</span>
        {status && (
          <span
            className="status"
            css={{
              color: theme.colors[tone],
              backgroundColor: toneMix(theme, tone, 16),
            }}
          >
            {status}
          </span>
        )}
      </div>
      {children}
    </MockCardSC>
  )
}

export const MockLine = styled.div<{ $width: number | string; $tone?: Tone }>(
  ({ theme, $width, $tone }) => ({
    height: 6,
    width: $width,
    borderRadius: 3,
    backgroundColor: $tone
      ? toneMix(theme, $tone, 55)
      : theme.colors['fill-three'],
  })
)

export const IconTile = styled.div<{ $tone: Tone; $size: number }>(
  ({ theme, $tone: tone, $size: size }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: size,
    height: size,
    borderRadius: theme.borderRadiuses.large,
    color: theme.colors[tone],
    backgroundColor: toneMix(theme, tone, 16),
    border: `1px solid ${toneMix(theme, tone, 28)}`,
  })
)

export const ProductPage = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
}))

const PageHeaderSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.medium,
  h1: {
    ...theme.partials.text.title2,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.small,
    margin: 0,
    color: theme.colors.text,
  },
  '.actions': {
    marginLeft: 'auto',
    display: 'flex',
    gap: theme.spacing.small,
  },
}))

const WrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
}))

const HeroSC = styled.div<{ $tone: Tone }>(({ theme, $tone }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing.xlarge,
  padding: `${theme.spacing.xxlarge} ${theme.spacing.xlarge}`,
  borderRadius: theme.borderRadiuses.large,
  border: `1px solid ${toneMix(theme, $tone, 24)}`,
  overflow: 'hidden',
  background: `linear-gradient(180deg, ${toneMix(theme, $tone, 24)} 0%, ${toneMix(theme, $tone, 6)} 70%, transparent 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(${toneMix(theme, $tone, 10)} 1px, transparent 1px), linear-gradient(90deg, ${toneMix(theme, $tone, 10)} 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    maskImage:
      'radial-gradient(ellipse 60% 70% at 50% 30%, black 0%, transparent 100%)',
  },
  '.copy': {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.small,
    textAlign: 'center',
    maxWidth: 760,
  },
  h2: {
    ...theme.partials.text.title1,
    margin: 0,
    color: theme.colors.text,
    textWrap: 'balance',
  },
  p: {
    ...theme.partials.text.body1,
    margin: 0,
    color: theme.colors['text-light'],
    span: { display: 'block', textWrap: 'balance' },
  },
  '.actions': {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.small,
    marginTop: theme.spacing.small,
  },
}))

const IllustrationSC = styled.div(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: theme.spacing.medium,
  width: '100%',
  height: 190,
  pointerEvents: 'none',
  userSelect: 'none',
  maskImage:
    'linear-gradient(180deg, black 55%, transparent 100%), linear-gradient(90deg, transparent 0%, black 25%, black 75%, transparent 100%)',
  maskComposite: 'intersect',
}))

const MockCardSC = styled.div<{ $faded: boolean }>(({ theme, $faded }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.small,
  width: 220,
  flexShrink: 0,
  marginTop: $faded ? theme.spacing.large : 0,
  padding: theme.spacing.medium,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders['fill-two'],
  backgroundColor: theme.colors['fill-one'],
  boxShadow: theme.boxShadows.moderate,
  opacity: $faded ? 0.45 : 1,
  '.header': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xsmall,
  },
  '.title': {
    ...theme.partials.text.caption,
    fontWeight: 600,
    color: theme.colors.text,
  },
  '.status': {
    ...theme.partials.text.caption,
    fontSize: 11,
    padding: '1px 6px',
    borderRadius: theme.borderRadiuses.medium,
  },
}))

const FeaturesSC = styled.div<{ $count: number }>(({ theme, $count }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${$count}, minmax(0, 1fr))`,
  gap: theme.spacing.medium,
}))

const FeatureCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xsmall,
  padding: theme.spacing.large,
  h3: {
    ...theme.partials.text.body2Bold,
    margin: 0,
    marginTop: theme.spacing.small,
    color: theme.colors.text,
  },
  p: {
    ...theme.partials.text.body2,
    margin: 0,
    color: theme.colors['text-light'],
    textWrap: 'balance',
  },
}))
