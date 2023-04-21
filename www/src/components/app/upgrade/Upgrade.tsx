import {
  Button,
  Card,
  Divider,
  ListBoxItem,
  PageTitle,
  Select,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import { P, Switch } from 'honorable'
import { capitalize, isEmpty } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'

import { UPDATE_INSTALLATION } from '../../repository/queries'
import { useAppContext } from '../../../contexts/AppContext'
import { GqlError } from '../../utils/Alert'
import { AppHeaderActions } from '../AppHeaderActions'

export function Upgrade() {
  const { installation, upgradeChannels = [] } = useAppContext()
  const [autoUpgrade, setAutoUpgrade] = useState(installation?.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation?.trackTag)
  const [mutation, { loading, error }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation?.id, attributes: { trackTag, autoUpgrade } },
  })
  const hasUpgradeChannels = useMemo(() => !isEmpty(upgradeChannels), [upgradeChannels])

  useEffect(() => {
    if (!autoUpgrade) setTrackTag(undefined)
  }, [autoUpgrade, setTrackTag])

  return (
    <>
      <PageTitle
        heading="Upgrade channel"
        paddingTop="medium"
      >
        <AppHeaderActions />
      </PageTitle>
      <Card
        display="flex"
        flexDirection="column"
        padding="xlarge"
      >
        <P
          body1
          bold
          marginBottom="xsmall"
        >
          Automatic upgrades
        </P>
        <P
          body2
          color="text-light"
          marginBottom="xlarge"
        >
          Determine how this application is updated on a regular basis.
        </P>
        <WrapWithIf
          wrapper={<Tooltip label="No upgrade channels available." />}
          condition={!hasUpgradeChannels}
        >
          <Switch
            checked={!autoUpgrade}
            onChange={({ target: { checked } }) => setAutoUpgrade(!checked)}
            disabled={!hasUpgradeChannels}
            marginBottom="xlarge"
          >
            None
          </Switch>
        </WrapWithIf>
        {autoUpgrade && upgradeChannels && hasUpgradeChannels && (
          <Select
            label="Select upgrade channel"
            selectedKey={trackTag}
            onSelectionChange={t => setTrackTag(`${t}`)}
          >
            {upgradeChannels.flatMap(t => (t ? [(
              <ListBoxItem
                key={t}
                label={capitalize(t)}
                textValue={t}
              />
            )] : []))}
          </Select>
        )}
        {error && (
          <GqlError
            error={error}
            header="Failed to uninstall"
          />
        )}
        <Divider
          backgroundColor="border"
          marginVertical="xlarge"
        />
        <Button
          onClick={mutation}
          disabled={autoUpgrade && isEmpty(trackTag)}
          loading={loading}
          alignSelf="end"
          width="max-content"
        >
          Save
        </Button>
      </Card>
    </>
  )
}
