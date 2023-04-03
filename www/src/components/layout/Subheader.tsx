import {
  A,
  Div,
  Flex,
  Text,
} from 'honorable'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  IconFrame,
  InfoIcon,
} from '@pluralsh/design-system'
import styled, { ThemeContext } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'

import { getPreviousUserData } from '../../helpers/authentication'
import { handlePreviousUserClick } from '../login/CurrentUser'
import CurrentUserContext from '../../contexts/CurrentUserContext'

export function ServiceAccountBanner() {
  const previousUser = getPreviousUserData()

  const me = useContext(CurrentUserContext)
  const theme = useContext(ThemeContext)

  if (!previousUser) {
    return null
  }

  return (
    <Flex
      direction="row"
      justifyContent="end"
      alignItems="center"
      columnGap={theme.spacing.xsmall}
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
        You are currently logged in as {me.email}.{' '}
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

const SubheaderContent = styled.div(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: theme.spacing.xxlarge,
  rowGap: theme.spacing.small,
  paddingTop: theme.spacing.small,
  paddingBottom: theme.spacing.small,
  alignItems: 'stretch',
  backgroundColor: theme.colors['fill-one'],
  justifyContent: 'space-between',
  maxHeight: '100%',
  paddingLeft: theme.spacing.large,
  paddingRight: theme.spacing.large,
}))

const SubheaderLeft = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,

}))

const SubheaderRight = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
}))

export default function Subheader() {
  const navigate = useNavigate()
  const previousUser = getPreviousUserData()

  return (
    <SubheaderContent>
      <SubheaderLeft>
        <IconFrame
          data-phid="nav-arrow-back"
          clickable
          size="small"
          icon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
          textValue="Back"
          type="floating"
        />
        <IconFrame
          data-phid="nav-arrow-forward"
          clickable
          size="small"
          icon={<ArrowRightIcon />}
          onClick={() => navigate(1)}
          textValue="Forward"
          type="floating"
        />
      </SubheaderLeft>
      <SubheaderRight>
        {!!previousUser && <ServiceAccountBanner />}
      </SubheaderRight>
    </SubheaderContent>
  )
}
