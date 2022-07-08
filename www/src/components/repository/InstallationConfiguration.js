import { useMutation } from '@apollo/client'
import { Flex, Input, Modal, RadioGroup, Span } from 'honorable'
import { Radio } from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import { Keyboard } from 'grommet'

import { Actions } from '../account/Actions'
import { GqlError } from '../utils/Alert'
import { Tabs } from '../utils/SidebarTabs'

import { DELETE_INSTALLATION_MUTATION, UPDATE_INSTALLATION } from './queries'

function MiniHeader({ header, description }) {
  return (
    <Flex direction="column">
      <Span fontWeight="bold">{header}</Span>
      <Span color="text-xlight">{description}</Span>
    </Flex>
  )
}

function UpdateUpgrades({ installation, setOpen }) {
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation.trackTag || '')
  const [mutation, { loading }] = useMutation(UPDATE_INSTALLATION, { variables: { 
    id: installation.id,
    attributes: { trackTag, autoUpgrade },
  } })
  
  const doSetTrackTag = useCallback(tag => {
    if (tag === 'none') {
      setAutoUpgrade(false)
  
      return
    }
    setAutoUpgrade(true)
    setTrackTag(tag)
  }, [setAutoUpgrade, setTrackTag])

  return (
    <Flex
      gap="medium"
      direction="column"
    >
      <MiniHeader
        header="Automatic upgrades"
        description="Chose the upgrade channel for new versions"
      />
      <RadioGroup
        direction="row"
        gap="medium"
      >
        {['latest', 'stable', 'warm'].map(t => (
          <Radio
            key={t}
            value={t}
            checked={trackTag === t && autoUpgrade}
            onChange={({ target: { checked } }) => checked && doSetTrackTag(t)}
          >
            {t}
          </Radio>
        ))}
        <Radio
          value="none"
          checked={!autoUpgrade}
          onChange={({ target: { checked } }) => checked && doSetTrackTag('none')}
        >
          none
        </Radio>
      </RadioGroup>
      <Actions
        cancel={() => setOpen(false)}
        submit={mutation}
        loading={loading}
        action="Update"
      />
    </Flex>
  )
  
}

function DeleteInstallation({ installation, setOpen }) {
  const { repository: { name } } = installation
  const [confirm, setConfirm] = useState('')
  const [mutation, { loading, error }] = useMutation(DELETE_INSTALLATION_MUTATION, {
    variables: {
      id: installation.id,
    },
    onCompleted: () => window.location.reload(),
  })

  return (
    <Keyboard onEnter={confirm !== name ? null : mutation}>
      <Flex
        direction="column"
        gap="medium"
      >

        {error && (
          <GqlError
            error={error}
            header="Failed to delete"
          />
        )}
        <MiniHeader
          header="Delete this installation"
          description="Type the application name to confirm.  This will only deregister the installation from plural and disable future upgrades, your application will continue running in your cluster."
        />
        <Input
          value={confirm}
          onChange={({ target: { value } }) => setConfirm(value)}
          placeholder={`type ${name} to confirm`}
          width="75%"
        />
        <Actions
          cancel={() => setOpen(false)}
          submit={confirm !== name ? null : mutation}
          loading={loading}
          action="Delete"
        />
      </Flex>
    </Keyboard>
  )
}
  
export function InstallationConfiguration({ installation, open, setOpen }) {
  const [tab, setTab] = useState('Upgrades')

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
    >
      <Flex
        width="50vw"
        direction="column"
        gap="medium"
      >
        <Tabs
          tabs={['Upgrades', 'Uninstall']}
          tab={tab}
          setTab={setTab}
        />
        {tab === 'Upgrades' && (
          <UpdateUpgrades
            installation={installation}
            setOpen={setOpen}
          />
        )}
        {tab === 'Uninstall' && (
          <DeleteInstallation
            installation={installation}
            setOpen={setOpen}
          />
        )}
      </Flex>
    </Modal> 
  )
}
  
