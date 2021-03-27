import React, { useCallback, useState } from 'react'
import { Box, Text } from 'grommet'
import { useMutation } from 'react-apollo'
import { Button } from 'forge-core'
import { INSTALL_REPO, REPO_Q } from './queries'
import Highlight from 'react-highlight.js'
import Plan from '../payments/Plan'
import CreatePlan, { CreateAnchor } from '../payments/CreatePlan'
import SubscribeModal from '../payments/CreateSubscription'
import { SubscriptionBadge } from '../payments/Subscription'
import UpdatePlan from '../payments/UpdatePlan'
import { EditInstallation } from './EditInstallation'
import { Tab, TabContent, Tabs } from '../utils/Tabs'
import './container.css'

function Plans({repository}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const {plans, editable, installation} = repository
  const {subscription, id} = installation ? installation : {}
  const approvePlan = useCallback((plan) => {
    if (!subscription) {
      setModal(
        <SubscribeModal
          plan={plan}
          installationId={id}
          repositoryId={repository.id}
          setOpen={setModal} />)
      return
    }

    setModal(<UpdatePlan plan={plan} repository={repository} setOpen={setModal} />)
  }, [setModal, id, repository])

  return (
    <>
    {modal}
    <Box pad='small' gap='small'>
      {plans.length > 0 ?
        plans.map((plan) => (
          <Plan key={plan.id}  
                subscription={subscription} 
                approvePlan={approvePlan} 
                repository={repository}
                plan={plan} />
        )) :
        <Text size='small'>This repo is currently free to use</Text>
      }
      {editable && (<CreateAnchor onClick={() => setOpen(true)} />)}
    </Box>
    {open && <CreatePlan repository={repository} setOpen={setOpen} />}
    </>
  )
}

export function DetailContainer({children, ...rest}) {
  return (
    <Box {...rest} border={{color: 'light-4'}}>
      {children}
    </Box>
  )
}

function InstallationInner({installation, repository}) {
  const [mutation] = useMutation(INSTALL_REPO, {
    variables: {repositoryId: repository.id},
    refetchQueries: [{query: REPO_Q, variables: {repositoryId: repository.id}}]
  })

  if (installation) return (
    <Box gap='small' pad='small'>
      {installation.subscription && (<SubscriptionBadge repository={repository} subscription={installation.subscription} />)}
      <Highlight language='bash'>
        {[`forge build --only ${repository.name}`, `forge deploy ${repository.name}`].join('\n')}
      </Highlight>
    </Box>
  )

  return (
    <Box pad='small'>
      <Button label='Install Repository' round='xsmall' onClick={mutation} />
    </Box>
  )
}

export default function Installation({repository, onUpdate, noHelm, open}) {
  const {installation} = repository
  const hasPlans = repository.plans && repository.plans.length > 0
  const [tab, setTab] = useState((noHelm && !installation) ? 'Configuration' : 'Installation')

  return (
    <Box>
      <Tabs>
        {(!noHelm || installation) && <Tab name='Installation' setTab={setTab} selected={tab} />}
        {(hasPlans || repository.editable) && <Tab name='Plans' setTab={setTab} selected={tab} />}
        {installation && <Tab name='Configuration' setTab={setTab} selected={tab} />}
      </Tabs>
      <TabContent>
        {tab === 'Installation' && <InstallationInner installation={installation} repository={repository} />}
        {tab === 'Plans' && <Plans repository={repository} />}
        {tab === 'Configuration' && (
          <EditInstallation
            installation={repository.installation}
            repository={repository}
            open={open}
            onUpdate={onUpdate} />
        )}
      </TabContent>
    </Box>
  )
}