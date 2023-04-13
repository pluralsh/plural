import {
  Button,
  Card,
  Divider,
  PageTitle,
  Radio,
  RadioGroup,
} from '@pluralsh/design-system'
import { P } from 'honorable'
import { capitalize } from 'lodash'
import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client'

import { useRepositoryContext } from '../../../contexts/RepositoryContext'
import { UPDATE_INSTALLATION } from '../../repository/queries'

export function Upgrade() {
  const { installation } = useRepositoryContext()
  const [autoUpgrade, setAutoUpgrade] = useState(installation?.autoUpgrade || false)
  const [trackTag, setTrackTag] = useState(installation?.trackTag || '')
  const [mutation, { loading }] = useMutation(UPDATE_INSTALLATION, {
    variables: { id: installation?.id, attributes: { trackTag, autoUpgrade } },
    onCompleted: () => null,
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
    <>
      <PageTitle
        heading="Upgrade channel"
        paddingTop="medium"
      />
      <Card
        display="flex"
        flexDirection="column"
        padding="xlarge"
        overflowY="auto"
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
        {/* {error && (
          <GqlError
            error={error}
            header="Failed to uninstall"
          />
        )} */}
        <Divider
          backgroundColor="border"
          marginVertical="xlarge"
        />
        <Button
          onClick={mutation}
          // disabled={confirm !== app.name}
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
