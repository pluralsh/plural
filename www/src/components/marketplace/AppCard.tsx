import {
  Div,
  Flex,
  H3,
  P,
  Span,
} from 'honorable'

import {
  AppIcon,
  Card,
  Chip,
  PadlockLockedIcon,
  RocketIcon,
  VerifiedIcon,
} from '@pluralsh/design-system'

import { Severity } from '@pluralsh/design-system/dist/types'

import { ComponentProps, ReactNode } from 'react'

import { Repository } from '../../generated/graphql'

export const getBorderColor = (severity?: Severity) => {
  switch (severity) {
  case 'error':
  case 'danger':
    return 'border-error'
  case 'warning':
    return 'border-warning'
  default:
    return ''
  }
}

type AppCardProps = {
  title: ReactNode
  subtitle?: ReactNode | null
  imageUrl: string
  description: string
  tags: string[]
  severity?: Severity
  rightContent?: ReactNode
  childrenProps: ComponentProps<typeof Div>
}

type MarketplaceAppCardProps = {
  repository: Repository
} & ComponentProps<typeof Div>

export function ListItemBorder({
  color,
  width = 3,
  radius = 4,
}: {
  color: string
  width?: number
  radius?: number
}) {
  return (
    <Div
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      borderRadius={radius}
      overflow="hidden"
    >
      <Div
        position="absolute"
        backgroundColor={color}
        width={width}
        height="100%"
      />
    </Div>
  )
}

export function AppCardBasicInfo({
  imageUrl,
  title,
  subtitle,
}: Pick<AppCardProps, 'imageUrl' | 'title' | 'subtitle'>) {
  return (
    <Flex
      align="center"
      gap="small"
      flexGrow={1}
      flexBasis="40%"
      padding="medium"
    >
      {imageUrl && (
        <AppIcon
          url={imageUrl}
          size="xsmall"
        />
      )}
      <Flex direction="column">
        <H3
          margin={0}
          body1
          fontWeight={600}
        >
          {title}
        </H3>
        {subtitle && <Flex>{subtitle}</Flex>}
      </Flex>
    </Flex>
  )
}

export function AppCard({
  title,
  subtitle,
  imageUrl,
  rightContent = <div>stuff</div>,
  children,
  severity,
  ...props
}: AppCardProps & ComponentProps<typeof Card>) {
  const borderColor = getBorderColor(severity)

  return (
    <Card
      clickable
      display="flex"
      flexGrow={1}
      flexShrink={1}
      flexDirection="column"
      position="relative"
      {...props}
    >
      {borderColor && <ListItemBorder color={borderColor} />}
      <Flex width="100%">
        <AppCardBasicInfo
          title={title}
          subtitle={subtitle}
          imageUrl={imageUrl}
        />
        {rightContent}
      </Flex>
      {children}
    </Card>
  )
}

export function MarketplaceAppCard({
  repository,
  ...props
}: MarketplaceAppCardProps) {
  const {
    installation,
    name,
    verified,
    private: priv,
    publisher,
    darkIcon,
    icon,
    trending,
    description,
  } = repository
  const installed = !!installation
  const tags = repository.tags?.map(t => t?.tag).filter(t => !!t) || []
  const maxTags = trending ? 5 : 6

  const fullTitle = (
    <Flex
      alignItems="center"
      gap={3}
    >
      {name}
      {verified && (
        <VerifiedIcon
          as="div"
          color="action-link-inline"
          size={12}
          position="relative"
          top={-1.5}
        />
      )}
    </Flex>
  )

  const rightContent = (
    <Flex
      paddingTop="medium"
      paddingRight="medium"
      paddingBottom="medium"
      alignItems="center"
      height="100%"
    >
      {installed ? (
        <Chip
          severity="success"
          size="large"
          hue="lighter"
        >
          <Span fontWeight={600}>Installed</Span>
        </Chip>
      ) : undefined}
      {!!priv && (
        <Chip
          size="large"
          hue="lighter"
          marginLeft={8}
          paddingHorizontal={8}
          paddingVertical={8}
          backgroundColor="transparent"
          border="none"
        >
          <PadlockLockedIcon />
        </Chip>
      )}
    </Flex>
  )

  const children = (
    <Flex
      flexDirection="column"
      paddingLeft="medium"
      paddingRight="medium"
      paddingBottom="medium"
      flexGrow={1}
    >
      {description && (
        <P
          body2
          marginTop="xsmall"
          color="text-light"
          style={{
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </P>
      )}
      <Div flexGrow={1} />
      {(trending || tags?.length > 0) && (
        <Flex
          marginTop="medium"
          gap="xsmall"
          flexWrap="wrap"
        >
          {!!trending && (
            <Chip
              size="small"
              hue="lighter"
            >
              <RocketIcon color="action-link-inline" />
              <Span
                color="action-link-inline"
                marginLeft="xxsmall"
              >
                Trending
              </Span>
            </Chip>
          )}
          {tags
            ?.filter((_x, i) => i < maxTags)
            .map(tag => (
              <Chip
                size="small"
                hue="lighter"
                key={tag}
                _last={{ marginRight: 0 }}
              >
                {tag}
              </Chip>
            ))}
        </Flex>
      )}
    </Flex>
  )

  return (
    <AppCard
      title={fullTitle}
      subtitle={publisher?.name}
      rightContent={rightContent}
      imageUrl={darkIcon || icon}
      {...props}
    >
      {children}
    </AppCard>
  )
}
