import {
  ArrowRightIcon,
  CheckRoundedIcon,
  CircleDashIcon,
} from '@pluralsh/design-system'
import styled from 'styled-components'

export type BuildTimelineItem = {
  title: string
  description: string
  done: boolean
}

export function BuildTimeline({ items }: { items: BuildTimelineItem[] }) {
  const activeIndex = items.findIndex(({ done }) => !done)

  return (
    <ListSC>
      {items.map(({ title, description, done }, i) => (
        <ItemSC
          key={title}
          aria-current={i === activeIndex ? 'step' : undefined}
        >
          <SpineSC>
            <NodeSC>
              {done ? (
                <CheckRoundedIcon
                  color="icon-success"
                  size={16}
                />
              ) : i === activeIndex ? (
                <ActiveNodeSC>
                  <ArrowRightIcon
                    color="icon-light"
                    size={10}
                  />
                </ActiveNodeSC>
              ) : (
                <CircleDashIcon
                  color="icon-light"
                  size={16}
                />
              )}
            </NodeSC>
            {i < items.length - 1 && <ConnectorSC />}
          </SpineSC>
          <BodySC>
            <span className="title">{title}</span>
            <span className="description">{description}</span>
          </BodySC>
        </ItemSC>
      ))}
    </ListSC>
  )
}

const ListSC = styled.ol(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xsmall,
  margin: 0,
  padding: 0,
  listStyle: 'none',
}))

const ItemSC = styled.li(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing.medium,
  minWidth: 0,
}))

const SpineSC = styled.div({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  flexShrink: 0,
  alignSelf: 'stretch',
  width: 24,
  minHeight: 48,
})

const NodeSC = styled.div({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
})

const ActiveNodeSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  border: `1px solid ${theme.colors['icon-light']}`,
  borderRadius: '50%',
}))

const ConnectorSC = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 24,
  bottom: `calc(-1 * ${theme.spacing.xsmall})`,
  left: '50%',
  width: 1,
  transform: 'translateX(-50%)',
  background: theme.colors.border,
}))

const BodySC = styled.div(({ theme }) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: theme.spacing.xxsmall,
  minWidth: 0,
  paddingTop: 2,
  paddingBottom: theme.spacing.small,
  '.title': { ...theme.partials.text.body2Bold, color: theme.colors.text },
  '.description': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },
}))
