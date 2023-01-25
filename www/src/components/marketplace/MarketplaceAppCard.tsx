import {
  Div,
  Flex,
  P,
  Span,
} from 'honorable'

import {
  Card,
  Chip,
  PadlockLockedIcon,
  RocketIcon,
  VerifiedIcon,
} from '@pluralsh/design-system'

import { ComponentProps } from 'react'

import { Maybe, Repository } from '../../generated/graphql'

import { AppCard } from './AppCard'

export type MarketplaceAppCardProps = {
  repository: Repository
} & Partial<ComponentProps<typeof Card>>

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
      gap={2}
    >
      {name}
      {verified && (
        <VerifiedIcon
          as="div"
          color="action-link-inline"
          size={10}
          position="relative"
          top={-4}
        />
      )}
    </Flex>
  )

  return (
    <AppCard
      title={fullTitle}
      subtitle={publisher?.name}
      rightContent={(
        <MarketplaceAppCardExtras
          installed={installed}
          priv={priv}
        />
      )}
      imageUrl={darkIcon || icon || undefined}
      {...props}
    >
      <MarketplaceAppCardContent
        {...{
          description,
          trending,
          tags,
          maxTags,
        }}
      />
    </AppCard>
  )
}

function MarketplaceAppCardExtras({
  installed,
  priv,
}: {
  installed: boolean
  priv: boolean | null | undefined
}) {
  return (
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
          size="medium"
          hue="lighter"
        >
          Installed
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
}

function MarketplaceAppCardContent({
  description,
  trending,
  tags,
  maxTags,
}: {
  description?: Maybe<string> | undefined
  trending?: boolean | null | undefined
  tags: (string | undefined)[]
  maxTags: number
}) {
  return (
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
          {tags?.slice(0, maxTags).map(tag => (
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
}
