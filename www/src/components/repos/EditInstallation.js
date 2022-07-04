import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Pill, Select } from 'forge-core'
import { Box, CheckBox, Text } from 'grommet'
import { Close } from 'grommet-icons'
import Toggle from 'react-toggle'

import { TAGS } from '../versions/VersionTags'
import { deepUpdate, updateCache } from '../../utils/graphql'
import { SectionPortal } from '../Explore'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'

import { REPO_Q, UPDATE_INSTALLATION } from './queries'

function update(cache, repositoryId, installation) {
  updateCache(cache, {
    query: REPO_Q,
    variables: { repositoryId },
    update: prev => deepUpdate(prev, 'repository.installation', () => installation),
  })
}

export function UpdateInstallation({ installation = {} }) {
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation.trackTag || '')

  const [mutation, { loading, data, error }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation.id, attributes: { autoUpgrade, trackTag } },
  })

  return (
    <Box
      fill
      pad="small"
    >
      {data && (
        <Alert
          status={AlertStatus.SUCCESS}
          header="Installation updated!"
          description="the changes will take effect immediately"
        />
      )}
      {error && (
        <GqlError
          error={error}
          header="Failed to update"
        />
      )}
      <Box
        direction="row"
        gap="small"
        align="center"
      >
        <Toggle
          checked={autoUpgrade}
          onChange={({ target: { checked } }) => setAutoUpgrade(checked)}
        />
        <Text size="small">Auto Upgrade</Text>
        {autoUpgrade && (
          <Box fill="horizontal">
            <Select
              value={{ value: trackTag, label: trackTag }}
              options={TAGS.map(tag => ({ value: tag, label: tag }))}
              onChange={({ value }) => setTrackTag(value)}
            />
          </Box>
        )}
      </Box>
      <SectionPortal>
        <Button
          loading={loading}
          label="Update"
          onClick={mutation}
        />
      </SectionPortal>
    </Box>
  )
}

export function EditInstallation({ installation, repository, onUpdate }) {
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade)
  const [trackTag, setTrackTag] = useState(installation.trackTag)
  const [notif, setNotif] = useState(false)
  const [mutation, { loading }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation.id, attributes: { autoUpgrade, trackTag } },
    update: (cache, { data: { updateInstallation } }) => {
      (onUpdate || update)(cache, repository.id, updateInstallation)
    },
    onCompleted: () => setNotif(true),
  })

  return (
    <>
      {notif && (
        <Pill
          background="status-ok"
          onClose={() => {
            console.log('wtf'); setNotif(false)
          }}
        >
          <Box
            direction="row"
            align="center"
            gap="small"
          >
            <Text>Configuration saved</Text>
            <Close
              style={{ cursor: 'pointer' }}
              size="15px"
              onClick={() => setNotif(false)}
            />
          </Box>
        </Pill>
      )}
      <Box
        gap="small"
        fill="horizontal"
        pad="small"
      >
        <Box
          height="50px"
          direction="row"
          gap="small"
          align="center"
          fill="horizontal"
        >
          <CheckBox
            toggle
            label="Auto upgrade"
            checked={autoUpgrade}
            onChange={e => setAutoUpgrade(e.target.checked)}
          />
          {autoUpgrade && (
            <Box fill="horizontal">
              <Select
                value={{ value: trackTag, label: trackTag }}
                options={TAGS.map(tag => ({ value: tag, label: tag }))}
                onChange={({ value }) => setTrackTag(value)}
              />
            </Box>
          )}
        </Box>
        <Box
          pad="small"
          direction="row"
          justify="end"
        >
          <Button
            pad={{ horizontal: 'medium', vertical: 'xsmall' }}
            loading={loading}
            label="Save"
            onClick={mutation}
            round="xsmall"
          />
        </Box>
      </Box>
    </>
  )
}
