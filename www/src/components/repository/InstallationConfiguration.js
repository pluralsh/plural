import { useMutation } from '@apollo/client'
import {
  Flex, Input, RadioGroup, Span,
} from 'honorable'
import {
  Modal, Radio, TabList, TabListItem, TabPanel,
} from 'pluralsh-design-system'
import { useCallback, useState } from 'react'
import { Keyboard } from 'grommet'
import { useTabListState } from '@react-stately/tabs'

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
  const tabs = {
    upgrades: {
      key: '1',
      label: 'Upgrades',
      content: <UpdateUpgrades
        installation={installation}
        setOpen={setOpen}
      />,
    },
    uninstall: {
      key: '2',
      label: 'Delete',
      content: <DeleteInstallation
        installation={installation}
        setOpen={setOpen}
      />,
    },
  }

  const tabListStateProps = {
    keyboardActivation: 'manual',
    orientation: 'horizontal',
    children: Object.entries(tabs).map(([key, tab]) => (
      <TabListItem
        key={key}
        width="100%"
        justifyContent="center"
      >
        {tab.label}
      </TabListItem>
    )),
  }

  const tabState = useTabListState(tabListStateProps)

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
        state={tabState}
        stateProps={tabListStateProps}
        flexShrink={0}
        {...{
          ' div > div': {
            justifyContent: 'center',
            padding: '7px 0',
          },
        }}
      />
      <TabPanel
        state={tabState}
        stateProps={tabListStateProps}
        paddingTop="large"
        paddingHorizontal="large"
      >
        {tabs[tabState.selectedKey]?.content}
      </TabPanel>
    </Modal>
  )
}

