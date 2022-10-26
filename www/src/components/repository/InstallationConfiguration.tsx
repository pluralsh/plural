import { useMutation } from '@apollo/client'
import {
  Flex,
  Input,
  RadioGroup,
  Span,
} from 'honorable'
import {
  Modal,
  Radio,
  Tab,
  TabList,
  TabPanel,
} from 'pluralsh-design-system'
import { useCallback, useRef, useState } from 'react'
import { Keyboard } from 'grommet'
import capitalize from 'lodash/capitalize'

import { Actions } from '../account/Actions'
import { GqlError } from '../utils/Alert'

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

function UpdateUpgrades({
  autoUpgrade, setAutoUpgrade, trackTag, setTrackTag,
}) {
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
          None
        </Radio>
      </RadioGroup>
    </Flex>
  )
}

function UninstallApp({
  installation, deleteMutation, deleteError, confirm, setConfirm,
}) {
  return (
    <Keyboard onEnter={confirm !== installation.repository.name ? null : deleteMutation}>
      <Flex
        direction="column"
        gap="medium"
      >
        {deleteError && (
          <GqlError
            error={deleteError}
            header="Failed to uninstall"
          />
        )}
        <MiniHeader
          header="Uninstall this application"
          description={`Type the application name, "${installation.repository.name}", to confirm uninstall. Note that this will uninstall this app from the API but not destroy any of its infrastructure.`}
        />
        <Input
          value={confirm}
          onChange={({ target: { value } }) => setConfirm(value)}
          placeholder="Confirm application name"
        />
      </Flex>
    </Keyboard>
  )
}

export function InstallationConfiguration({ installation, open, setOpen }) {
  const tabStateRef = useRef()
  const [selectedTabKey, setSelectedKey] = useState()

  // Update tab controls.
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation.trackTag || '')
  const [updateMutation, { loading: updateLoading }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation.id, attributes: { trackTag, autoUpgrade } },
    onCompleted: () => setOpen(false),
  })

  // Delete tab controls.
  const [confirm, setConfirm] = useState('')
  const [deleteMutation, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_INSTALLATION_MUTATION, {
    variables: { id: installation.id },
    onCompleted: () => window.location.reload(),
  })

  const tabs = {
    upgrades: {
      label: 'Upgrades',
      content: <UpdateUpgrades
        autoUpgrade={autoUpgrade}
        setAutoUpgrade={setAutoUpgrade}
        trackTag={trackTag}
        setTrackTag={setTrackTag}
      />,
      actions: <Actions
        cancel={() => setOpen(false)}
        submit={updateMutation}
        loading={updateLoading}
        action="Update"
      />,
    },
    uninstall: {
      label: 'Uninstall',
      content: <UninstallApp
        installation={installation}
        deleteMutation={deleteMutation}
        deleteError={deleteError}
        confirm={confirm}
        setConfirm={setConfirm}
      />,
      actions: <Actions
        cancel={() => setOpen(false)}
        submit={confirm !== installation.repository.name ? null : deleteMutation}
        loading={deleteLoading}
        destructive
        action={`Uninstall ${installation.repository.name}`}
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
      actions={tabs[selectedTabKey]?.actions}
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
