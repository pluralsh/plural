import { useContext, useMemo, useState } from 'react'
import {
  Div,
  Flex,
  Spinner,
  Switch,
} from 'honorable'
import {
  Card,
  CloseIcon,
  ClusterIcon,
  PeopleIcon,
} from '@pluralsh/design-system'

import { useQuery } from '@apollo/client'

import CurrentUserContext from '../../../contexts/CurrentUserContext'

import { CLUSTER_PRICING, USER_PRICING } from './constants'

import { USERS_QUERY } from './queries'

function BillingPreview() {
  const { me } = useContext(CurrentUserContext)
  const [isProfessional, setIsProfessional] = useState(false)
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY)

  const nClusters = useMemo(() => me?.account?.clusterCount ?? 0, [me])
  const nUsers = useMemo(() => usersData?.users?.edges?.length ?? 0, [usersData])
  const pClusters = isProfessional ? CLUSTER_PRICING : 0
  const pUsers = isProfessional ? USER_PRICING : 0
  const total = nClusters * pClusters + nUsers * pUsers

  if (usersLoading) {
    return (
      <Card
        padding="large"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Card>
    )
  }

  return (
    <Card padding="large">
      <Flex
        align="center"
        justify="space-between"
      >
        <Div
          body1
          fontWeight={600}
        >
          Your usage
        </Div>
        <Switch
          checked={isProfessional}
          onChange={event => setIsProfessional(event.target.checked)}
          padding={0}
        >
          <Div
            color="text-xlight"
            marginLeft="xxsmall"
          >
            Preview Professional plan
          </Div>
        </Switch>
      </Flex>
      <Div marginTop="large">
        <Flex
          align="center"
          gap="medium"
        >
          <ClusterIcon />
          <Div>
            {nClusters} cluster{nClusters > 1 ? 's' : ''}
          </Div>
          <CloseIcon size={12} />
          <Div>
            ${pClusters}/month
          </Div>
          <Div
            borderBottom="1px solid border"
            flexGrow={1}
          />
          <Div>
            ${nClusters * pClusters}/month
          </Div>
        </Flex>
        <Flex
          align="center"
          gap="medium"
          marginTop="small"
        >
          <PeopleIcon />
          <Div>
            {nUsers} user{nUsers > 1 ? 's' : ''}
          </Div>
          <CloseIcon size={12} />
          <Div>
            ${pUsers}/month
          </Div>
          <Div
            borderBottom="1px solid border"
            flexGrow={1}
          />
          <Div>
            ${nUsers * pUsers}/month
          </Div>
        </Flex>
      </Div>
      <Flex
        marginTop="large"
        justify="flex-end"
        fontWeight={600}
        body1
      >
        Total: ${total}/month
      </Flex>
    </Card>
  )
}

export default BillingPreview
