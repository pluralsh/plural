import './container.css'

import { useCallback, useState } from 'react'
import { Box, Text } from 'grommet'

import { Div, useTheme } from 'honorable'

import { Codeline } from '@pluralsh/design-system'

import Plan from '../payments/Plan'
import CreatePlan, { CreateAnchor } from '../payments/CreatePlan'
import SubscribeModal from '../payments/CreateSubscription'
import { SubscriptionBadge } from '../payments/Subscription'
import UpdatePlan from '../payments/UpdatePlan'

import { Tab, TabContent, Tabs } from '../utils/Tabs'

import { EditInstallation } from './EditInstallation'

export function Plans({ repository, nocreate }: any) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<any>(null)
  const { plans, editable, installation } = repository
  const { subscription, id } = installation || {}

  const approvePlan = useCallback(plan => {
    if (!subscription) {
      setModal(<SubscribeModal
        plan={plan}
        installationId={id}
        repositoryId={repository.id}
        setOpen={setModal}
      />)

      return
    }

    setModal(<UpdatePlan
      plan={plan}
      repository={repository}
      setOpen={setModal}
    />)
  }, [setModal, id, repository, subscription])

  return (
    <>
      {modal}
      <Box
        pad="small"
        gap="small"
      >
        {plans.length > 0
          ? plans.map(plan => (
            <Plan
              key={plan.id}
              subscription={subscription}
              approvePlan={approvePlan}
              repository={repository}
              plan={plan}
            />
          ))
          : <Text size="small">This repo is currently free to use</Text>}
        {editable && (<CreateAnchor onClick={() => setOpen(true)} />)}
      </Box>
      {open && !nocreate && (
        <CreatePlan
          repository={repository}
          setOpen={setOpen}
        />
      )}
    </>
  )
}

export function DetailContainer({ children, title, ...rest }: any) {
  return (
    <Box
      border
      round="xsmall"
      {...rest}
    >
      {(!!title && (
        <Div
          color="text-xlight"
          fontSize={12}
          overline
        >
          {title}
        </Div>
      ))}
      {children}
    </Box>
  )
}

export function InstallationInner({ installation, repository }: any) {
  const theme = useTheme()

  if (installation) {
    return (
      <Box
        gap="small"
        pad="small"
      >
        {installation.subscription && (
          <SubscriptionBadge
            repository={repository}
            subscription={installation.subscription}
          />
        )}
        <Codeline
          language="bash"
          style={{ backgroundColor: theme.utils?.resolveColorString('fill-two') }}
        >
          {[`plural build --only ${repository.name}`, `plural deploy ${repository.name}`].join('\n')}
        </Codeline>
      </Box>
    )
  }

  return null
}

export default function Installation({
  repository, onUpdate, noHelm, open,
}: any) {
  const { installation } = repository
  const hasPlans = repository.plans && repository.plans.length > 0
  const [tab, setTab] = useState((noHelm && !installation) ? 'Configuration' : 'Installation')

  return (
    <Box>
      <Tabs>
        {(!noHelm || installation) && (
          <Tab
            name="Installation"
            setTab={setTab}
            selected={tab}
          />
        )}
        {(hasPlans || repository.editable) && (
          <Tab
            name="Plans"
            setTab={setTab}
            selected={tab}
          />
        )}
        {installation && (
          <Tab
            name="Configuration"
            setTab={setTab}
            selected={tab}
          />
        )}
      </Tabs>
      <TabContent>
        {tab === 'Installation' && (
          <InstallationInner
            installation={installation}
            repository={repository}
          />
        )}
        {tab === 'Plans' && <Plans repository={repository} />}
        {tab === 'Configuration' && (
          <EditInstallation
            installation={repository.installation}
            repository={repository}
            open={open}
            onUpdate={onUpdate}
          />
        )}
      </TabContent>
    </Box>
  )
}
