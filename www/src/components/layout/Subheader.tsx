import { A, Flex, Text } from 'honorable'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  IconFrame,
  InfoIcon,
} from '@pluralsh/design-system'
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'

import { getPreviousUserData } from '../../helpers/authentication'
import { handlePreviousUserClick } from '../login/CurrentUser'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'

export function ServiceAccountBanner() {
  const previousUser = getPreviousUserData()

  const { me } = useContext(CurrentUserContext)
  const theme = useTheme()

  if (!previousUser) {
    return null
  }

  return (
    <Flex
      direction="row"
      justifyContent="left"
      alignItems="center"
      gap={theme.spacing.xsmall}
      height="100%"
    >
      <InfoIcon
        size={12}
        color="text-warning-light"
      />
      <Text
        caption
        color={theme.colors['text-xlight']}
      >
        You are currently logged into the service account {me.email}.{' '}
        <A
          inline
          onClick={() => handlePreviousUserClick(previousUser)}
        >
          Switch to {previousUser.me.email}
        </A>
      </Text>
    </Flex>
  )
}

export default function Subheader() {
  const navigate = useNavigate()
  const theme = useTheme()
  const previousUser = getPreviousUserData()

  return (
    <Flex
      align="center"
      backgroundColor={theme.colors['fill-one']}
      borderBottom="1px solid border"
      minHeight={48}
      paddingHorizontal="large"
    >
      <ResponsiveLayoutSidenavContainer
        gap="small"
        display="flex"
        width={240}
      >
        <IconFrame
          clickable
          size="small"
          icon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
          textValue="Back"
          type="floating"
        />
        <IconFrame
          clickable
          size="small"
          icon={<ArrowRightIcon />}
          onClick={() => navigate(1)}
          textValue="Forward"
          type="floating"
        />
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutContentContainer>
        {!!previousUser && <ServiceAccountBanner />}
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSidecarContainer width={200} />
      <ResponsiveLayoutSpacer />
    </Flex>
  )
}
