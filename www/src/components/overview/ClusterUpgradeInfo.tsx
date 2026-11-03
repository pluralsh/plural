import { Chip, Flex, IconFrame } from '@pluralsh/design-system'
import { isEmpty } from 'lodash'

import { useTheme } from 'styled-components'

import { Maybe, UpgradeInfoFragment } from '../../generated/graphql'
import { getRepoIcon } from '../../utils/getRepoIcon'

type ClusterUpgradeInfoProps = {
  upgradeInfo?: Maybe<Maybe<UpgradeInfoFragment>[]>
}

export function ClusterUpgradeInfo({ upgradeInfo }: ClusterUpgradeInfoProps) {
  const theme = useTheme()

  if (isEmpty(upgradeInfo)) return null

  return (
    <Flex
      backgroundColor={theme.colors['fill-two']}
      borderRadius={theme.borderRadiuses.large}
      direction="column"
    >
      {upgradeInfo?.map((upgrade, i) => {
        const repository = upgrade?.installation?.repository

        return (
          <Flex
            key={upgrade?.installation?.id}
            align="center"
            borderBottom={
              i + 1 === upgradeInfo?.length
                ? ''
                : `1px solid ${theme.colors['border-fill-two']}`
            }
            gap="medium"
            grow={1}
            paddingLeft="medium"
            paddingRight="medium"
            paddingTop="small"
            paddingBottom="small"
          >
            <IconFrame
              icon={
                <img
                  src={getRepoIcon(repository, theme.mode)}
                  width={16}
                  height={16}
                />
              }
              size="medium"
              type="floating"
              css={{
                '&&': {
                  marginRight: theme.spacing.xxsmall,
                },
              }}
            />
            <Flex
              grow={1}
              css={{ ...theme.partials.text.body2Bold }}
            >
              {repository?.name}
            </Flex>
            <Chip
              fillLevel={3}
              severity="warning"
              size="small"
            >
              {upgrade?.count} pending
            </Chip>
          </Flex>
        )
      })}
    </Flex>
  )
}
