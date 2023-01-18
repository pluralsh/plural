import { useState } from 'react'
import { Div, Flex, Switch } from 'honorable'

import { CloseIcon, ClusterIcon, PeopleIcon } from '@pluralsh/design-system'

import { CLUSTER_PRICING, USER_PRICING } from './constants'

function BillingPreview() {
  const [isProfessional, setIsProfessional] = useState(false)

  const nClusters = 2
  const pClusters = isProfessional ? CLUSTER_PRICING : 0
  const nUsers = 4
  const pUsers = isProfessional ? USER_PRICING : 0
  const total = nClusters * pClusters + nUsers * pUsers

  return (
    <Div
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      padding="large"
    >
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
            {nClusters} clusters
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
            {nUsers} users
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
    </Div>
  )
}

export default BillingPreview
