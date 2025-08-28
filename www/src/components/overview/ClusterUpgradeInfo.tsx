import { CaretRightIcon, Chip, IconFrame } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { isEmpty } from 'lodash'
import { Link } from 'react-router-dom'

import { useTheme } from 'styled-components'

import { Maybe, UpgradeInfoFragment } from '../../generated/graphql'
import { getRepoIcon } from '../repository/misc'

type ClusterUpgradeInfoProps = {
  clusterId?: Maybe<string>
  upgradeInfo?: Maybe<Maybe<UpgradeInfoFragment>[]>
}

export function ClusterUpgradeInfo({
  clusterId,
  upgradeInfo,
}: ClusterUpgradeInfoProps) {
  const theme = useTheme()

  if (isEmpty(upgradeInfo)) return null

  return (
    <Flex
      backgroundColor="fill-two"
      borderRadius="large"
      direction="column"
    >
      {upgradeInfo?.map((upgrade, i) => {
        const repository = upgrade?.installation?.repository

        return (
          <Flex
            key={upgrade?.installation?.id}
            align="center"
            borderBottom={
              i + 1 === upgradeInfo?.length ? '' : '1px solid border-fill-two'
            }
            gap="medium"
            grow={1}
            paddingHorizontal="medium"
            paddingVertical="small"
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
              body2
              bold
              grow={1}
            >
              {repository?.name}
            </Flex>
            <Chip
              hue="lightest"
              severity="warning"
              size="small"
            >
              {upgrade?.count} pending
            </Chip>
            <IconFrame
              clickable
              size="medium"
              icon={<CaretRightIcon />}
              as={Link}
              to={`/apps/${clusterId}/${repository?.name}`}
              textValue="Go to app settings"
              tooltip
              type="tertiary"
            />
          </Flex>
        )
      })}
    </Flex>
  )
}
