import { useMutation } from '@apollo/client'
import { Flex, RadioGroup, Span } from 'honorable'
import {
  Modal,
  Radio,
  Tab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { useCallback, useRef, useState } from 'react'
import capitalize from 'lodash/capitalize'

import { Actions } from '../account/Actions'

import { UPDATE_INSTALLATION } from '../repository/queries'

function MiniHeader({ header, description }: any) {
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
}: any) {
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
            onChange={({ target: { checked } }: any) => checked && doSetTrackTag(t)}
          >
            {capitalize(t)}
          </Radio>
        ))}
        <Radio
          value="none"
          checked={!autoUpgrade}
          onChange={({ target: { checked } }: any) => checked && doSetTrackTag('none')}
        >
          None
        </Radio>
      </RadioGroup>
    </Flex>
  )
}

export function InstallationConfiguration({ installation, open, setOpen }: any) {
  const tabStateRef = useRef<any>(null)
  const [selectedTabKey, setSelectedKey] = useState<any>('')

  // Update tab controls.
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation.trackTag || '')
  const [updateMutation, { loading: updateLoading }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation.id, attributes: { trackTag, autoUpgrade } },
    onCompleted: () => setOpen(false),
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
        paddingLeft="large"
        paddingRight="large"
      >
        {tabs[selectedTabKey]?.content}
      </TabPanel>
    </Modal>
  )
}
