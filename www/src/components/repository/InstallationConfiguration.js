import { useMutation } from '@apollo/client'
import {
  Flex, Input, RadioGroup, Span,
} from 'honorable'
import {
  Modal, Radio, Tab, TabList, TabPanel,
} from 'pluralsh-design-system'
import { useCallback, useRef, useState } from 'react'
import { Keyboard } from 'grommet'

import { Actions } from '../account/Actions'
import { GqlError } from '../utils/Alert'

import { capitalize } from '../../utils/string'

import { DELETE_INSTALLATION_MUTATION, UPDATE_INSTALLATION } from './queries'

function MiniHeader({ header, description }) {
  return (
    <Flex
      direction="column"
      gap="xxsmall"
    >
      <Span
        body1
        bold
      >{header}
      </Span>
      <Span
        body2
        color="text-light"
      >{description}
      </Span>
    </Flex>
  )
}

function UpdateUpgrades({ installation, setOpen }) {
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation.trackTag || '')
  const [mutation, { loading }] = useMutation(UPDATE_INSTALLATION, {
    variables: {
      id: installation.id,
      attributes: { trackTag, autoUpgrade },
    },
  })

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
      paddingTop="medium"
    >
      <MiniHeader
        header="Automatic upgrades"
        description="Determine how this application is updated on a regular basis."
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
            {capitalize(t)}
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
          description={`Type the application name, "${name}", to confirm deletion.`}
        />
        <Input
          value={confirm}
          onChange={({ target: { value } }) => setConfirm(value)}
          placeholder="Confirm application name"
          width="75%"
        />
        <Actions
          cancel={() => setOpen(false)}
          submit={confirm !== name ? null : mutation}
          loading={loading}
          destructive
          action="Delete installation"
        />
      </Flex>
    </Keyboard>
  )
}

export function InstallationConfiguration({ installation, open, setOpen }) {
  const tabStateRef = useRef()
  const [selectedTabKey, setSelectedKey] = useState()
  const tabs = {
    upgrades: {
      label: 'Upgrades',
      content: <UpdateUpgrades
        installation={installation}
        setOpen={setOpen}
      />,
    },
    uninstall: {
      label: 'Delete',
      content: <DeleteInstallation
        installation={installation}
        setOpen={setOpen}
      />,
    },
  }

  return (
    <Modal
      form
      open={open}
      onClose={() => setOpen(false)}
      paddingRight={0}
      paddingLeft={0}
      paddingTop={0}
    >
      <TabList
        stateRef={tabStateRef}
        stateProps={{
          keyboardActivation: 'manual',
          orientation: 'horizontal',
          onSelectionChange: setSelectedKey,
          selectedKey: selectedTabKey,
        }}
        flexShrink={0}
        {...{
          ' div > div': {
            justifyContent: 'center',
            padding: '7px 0',
          },
        }}
      >
        {Object.entries(tabs).map(([key, tab]) => (
          <Tab
            key={key}
            width="100%"
            justifyContent="center"
            textValue={tab.label}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanel
        stateRef={tabStateRef}
        paddingTop="large"
        paddingHorizontal="large"
      >
        {tabs[selectedTabKey]?.content}
      </TabPanel>
    </Modal>
  )
}
