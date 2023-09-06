import {
  Button,
  Callout,
  Card,
  Divider,
  ListBoxItem,
  PageTitle,
  Select,
  Switch,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import { Div, Flex, P } from 'honorable'
import { isEmpty } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useMutation } from '@apollo/client'

import { UPDATE_INSTALLATION } from '../../repository/queries'
import { useAppContext } from '../../../contexts/AppContext'
import { GqlError } from '../../utils/Alert'
import { AppHeaderActions } from '../AppHeaderActions'
import { useUpdateState } from '../../../hooks/useUpdateState'

export function Upgrade() {
  const { installation, upgradeChannels = [] } = useAppContext()

  const {
    state: formState,
    update: updateFormState,
    hasUpdates,
  } = useUpdateState({
    autoUpgrade: installation?.autoUpgrade,
    trackTag: installation?.trackTag,
  })
  const { autoUpgrade, trackTag } = formState
  const [mutation, { loading, error }] = useMutation(UPDATE_INSTALLATION, {
    variables: {
      id: installation?.id,
      attributes: { trackTag, autoUpgrade },
    },
  })
  const hasUpgradeChannels = useMemo(
    () => !isEmpty(upgradeChannels),
    [upgradeChannels]
  )

  const toggleAutoUpgrade = useCallback(() => {
    updateFormState({
      autoUpgrade: !autoUpgrade,
      ...(!autoUpgrade ? { trackTag: 'latest' } : {}),
    })
  }, [autoUpgrade, updateFormState])

  return (
    <Div paddingBottom="large">
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
        <Flex>
          <WrapWithIf
            wrapper={<Tooltip label="No upgrade channels available." />}
            condition={!hasUpgradeChannels}
          >
            <Switch
              checked={autoUpgrade}
              onChange={toggleAutoUpgrade}
              loading
              disabled={!hasUpgradeChannels}
              marginBottom="xlarge"
              flexGrow={0}
            >
              {autoUpgrade ? 'On' : 'None'}
            </Switch>
          </WrapWithIf>
        </Flex>

        {autoUpgrade && upgradeChannels && hasUpgradeChannels && (
          <Select
            label="Select upgrade channel"
            selectedKey={trackTag}
            onSelectionChange={(t) => updateFormState({ trackTag: `${t}` })}
          >
            {upgradeChannels.flatMap((t) =>
              t
                ? [
                    <ListBoxItem
                      key={t}
                      label={t}
                      textValue={t}
                    />,
                  ]
                : []
            )}
          </Select>
        )}
        {error && (
          <GqlError
            error={error}
            header="Failed to update installation"
          />
        )}
        <Flex marginTop="xlarge">
          <Callout
            severity="warning"
            title="Be careful downgrading applications"
          >
            Changing to an upgrade channel that can downgrade an application can
            cause unexpected behavior, especially for apps that involve database
            migrations Plural cannot fully control.
          </Callout>
        </Flex>
        <Divider
          backgroundColor="border"
          marginVertical="xlarge"
        />
        <Button
          onClick={mutation}
          disabled={!hasUpdates || (autoUpgrade && isEmpty(trackTag))}
          loading={loading}
          alignSelf="end"
          width="max-content"
        >
          Save
        </Button>
      </Card>
    </Div>
  )
}
