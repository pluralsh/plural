import React, { useState } from 'react'
import { Box, Text, CheckBox, Anchor } from 'grommet'
import { Alert, Close } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import Button from '../utils/Button'
import { INSTALL_REPO, UPDATE_INSTALLATION, REPO_Q } from './queries'
import Pill from '../utils/Pill'
import yaml from 'js-yaml'
import Highlight from 'react-highlight.js'
import Expander from '../utils/Expander'
import Carousel from '../utils/Carousel'
import Plan from '../payments/Plan'
import CreatePlan from '../payments/CreatePlan'
import SubscribeModal from '../payments/CreateSubscription'
import { SubscriptionBadge } from '../payments/Subscription'
import UpdatePlan from '../payments/UpdatePlan'
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"
import './container.css'

function update(cache, repositoryId, installation) {
  const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId} })
  cache.writeQuery({query: REPO_Q,
    variables: {repositoryId},
    data: {...prev, repository: { ...prev.repository, installation: installation}}
  })
}

function EditInstallation({installation, repository, onUpdate, open}) {
  const [ctx, setCtx] = useState(yaml.safeDump(installation.context || {}, null, 2))
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade)
  const [notif, setNotif] = useState(false)
  const [mutation, {loading, errors}] = useMutation(UPDATE_INSTALLATION, {
    variables: {id: installation.id, attributes: {context: ctx, autoUpgrade}},
    update: (cache, {data: {updateInstallation}}) => {
      const func = onUpdate || update
      func(cache, repository.id, updateInstallation)
      setNotif(true)
    }
  })

  return (
    <>
    {notif && (
      <Pill background='status-ok' onClose={() => {console.log('wtf'); setNotif(false)}}>
        <Box direction='row' align='center' gap='small'>
          <Text>Configuration saved</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setNotif(false)} />
        </Box>
      </Pill>
    )}
    <Expander text='Configuration' open={open}>
      <Box gap='small' fill='horizontal' pad='small'>
        <Box>
          <AceEditor
            mode='yaml'
            theme='terminal'
            height='300px'
            width='100%'
            name='Configuration'
            value={ctx}
            showGutter
            showPrintMargin
            highlightActiveLine
            editorProps={{ $blockScrolling: true }}
            onChange={setCtx} />
        </Box>
        {errors && (
          <Box direction='row' gap='small'>
            <Alert size='15px' color='notif' />
            <Text size='small' color='notif'>Must be in json format</Text>
          </Box>)}
        <Box direction='row' justify='end'>
          <CheckBox
            toggle
            label='Auto Upgrade'
            checked={autoUpgrade}
            onChange={(e) => setAutoUpgrade(e.target.checked)}
          />
        </Box>
        <Box pad='small' direction='row' justify='end'>
          <Button
            pad={{horizontal: 'medium', vertical: 'xsmall'}}
            loading={loading}
            label='Save'
            onClick={mutation}
            round='xsmall' />
        </Box>
      </Box>
    </Expander>
    </>
  )
}


function PlanCarousel({repository}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const {plans, editable, installation} = repository
  const {subscription, id} = installation ? installation : {}

  function approvePlan(plan) {
    if (!subscription) {
      setModal(
        <SubscribeModal plan={plan} installationId={id} repositoryId={repository.id} setOpen={setModal} />
      )
      return
    }

    setModal(<UpdatePlan plan={plan} repository={repository} setOpen={setModal} />)
  }

  return (
    <>
    {modal}
    <Expander text='Plans'>
      <Box pad='small' gap='small'>
        {plans.length > 0 ?
          <Carousel
            draggable={false}
            slidesPerPage={1}
            offset={12}
            edges={plans}
            mapper={(plan) => (
              <Plan
                key={plan.id}
                {...plan}
                subscription={subscription}
                approvePlan={approvePlan} />
            )}
            fetchMore={() => null} /> :
          <Text size='small'>This repo is currently free to use</Text>
        }
        {editable && (<Box direction='row' justify='end'>
          <Anchor onClick={() => setOpen(true)} size='small'>Create more</Anchor>
        </Box>)}
      </Box>
    </Expander>
    {open && <CreatePlan repository={repository} setOpen={setOpen} />}
    </>
  )
}

export default function Installation({repository, onUpdate, noHelm, open, integrations, fetchMore}) {
  const [mutation] = useMutation(INSTALL_REPO, {
    variables: {repositoryId: repository.id},
    update: (cache, { data: { createInstallation } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q,
        variables: {repositoryId: repository.id},
        data: {...prev, repository: { ...prev.repository, installation: createInstallation}}
      })
    }
  })
  const hasPlans = repository.plans && repository.plans.length > 0
  const {installation} = repository

  if (installation) {
    return (
      <Box elevation='small' gap='small'>
        <Box>
          {!noHelm && (
            <Box gap='small' pad='small' border='bottom'>
              <Text size='small' style={{fontWeight: 500}}>Installation</Text>
              <Box>
                <Highlight language='bash'>
                  {`chartmart build --only ${repository.name}
chartmart deploy ${repository.name}`}
                </Highlight>
              </Box>
              {installation.subscription && (<SubscriptionBadge repository={repository} {...installation.subscription} />)}
            </Box>
          )}
          {(hasPlans || repository.editable) && <PlanCarousel repository={repository} />}
          <EditInstallation
            installation={repository.installation}
            repository={repository}
            open={open}
            onUpdate={onUpdate} />
        </Box>
      </Box>
    )
  }

  return (
    <Box elevation='small' gap='small'>
      <Box pad='small'>
        <Button label='Install Repository' round='xsmall' onClick={mutation} />
      </Box>
      {(hasPlans || repository.editable) && <PlanCarousel repository={repository} />}
    </Box>
  )
}