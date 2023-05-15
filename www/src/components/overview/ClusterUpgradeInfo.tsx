import { isEmpty } from 'lodash'
import { Flex } from 'honorable'
import { CaretRightIcon, Chip, IconFrame } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import { Maybe, UpgradeInfo } from '../../generated/graphql'

type ClusterUpgradeInfoProps = {
  clusterId?: Maybe<string>
  upgradeInfo?: Maybe<Maybe<UpgradeInfo>[]>
}

export function ClusterUpgradeInfo({
  clusterId,
  upgradeInfo,
}: ClusterUpgradeInfoProps) {
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
                  src={repository?.darkIcon || repository?.icon || ''}
                  width={16}
                  height={16}
                />
              }
              marginRight="xxsmall"
              size="medium"
              type="floating"
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
              // @ts-expect-error
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
