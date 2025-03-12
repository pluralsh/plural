import {
  Button,
  Callout,
  Flex,
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import {
  CloudProvider,
  ConsoleSize,
  useCreateConsoleInstanceMutation,
} from 'generated/graphql'
import { useLayoutEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { GqlError } from 'components/utils/Alert'

import { firstLetterUppercase } from 'components/overview/clusters/plural-cloud/CloudInstanceTableCols'

import {
  CreateClusterStepKey,
  useCreateClusterContext,
} from '../CreateClusterWizard'
import { Confirm } from '../../utils/Confirm'

const nameRegex = /^[a-z][a-z0-9-][a-z0-9]{4,9}$/

export function ConfigureCloudInstanceStep() {
  const theme = useTheme()
  const { setCurStep, setContinueBtn, setConsoleInstanceId, hostingOption } =
    useCreateClusterContext()

  const [name, setName] = useState('')
  const [size, setSize] = useState<ConsoleSize>(ConsoleSize.Small)
  const [cloud, setCloud] = useState<CloudProvider>(CloudProvider.Aws)
  const [region, setRegion] = useState<string>(regions[0])
  const [confirm, setConfirm] = useState(false)
  const isNameValid = nameRegex.test(name)

  const canSubmit = !!(
    isNameValid &&
    size &&
    cloud &&
    (cloud === CloudProvider.Aws ? region : true)
  )

  const [mutation, { loading, error }] = useCreateConsoleInstanceMutation({
    variables: {
      attributes: {
        name,
        size,
        cloud,
        region,
        type: hostingOption,
      },
    },
    onCompleted: (data) => {
      setConsoleInstanceId(data?.createConsoleInstance?.id)
      setCurStep(CreateClusterStepKey.InstallCli)
    },
  })

  // using layout effect to avoid flickering
  useLayoutEffect(() => {
    setContinueBtn(
      <Button
        key="create"
        disabled={!canSubmit}
        onClick={() => setConfirm(true)}
      >
        Continue
      </Button>
    )

    return () => {
      setContinueBtn(undefined)
    }
  }, [canSubmit, loading, mutation, setContinueBtn])

  return (
    <>
      <Flex
        flexDirection="column"
        gap="medium"
      >
        {error && <GqlError error={error} />}
        <Callout
          css={{ marginBottom: theme.spacing.medium }}
          title="Your Console may take a few minutes to deploy."
        >
          After completing this step it may take a few minutes for your Console
          to deploy. It will run in the background as you proceed.
        </Callout>
        <FormFieldSC
          label="Cluster name"
          hint={
            <FormFieldCaptionSC $name={name}>
              Name must be between 6 and 11 characters, lowercase, alphanumeric,
              and begin with a letter.
            </FormFieldCaptionSC>
          }
        >
          <Input
            placeholder="Enter cluster name"
            borderColor={
              name === '' || isNameValid
                ? undefined
                : theme.colors['border-danger']
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormFieldSC>
        <FormFieldSC label="Cluster size">
          <Select
            selectedKey={size}
            onSelectionChange={(size) => setSize(size as ConsoleSize)}
          >
            {Object.values(ConsoleSize)
              .reverse()
              .map((value) => (
                <ListBoxItem
                  key={value}
                  label={firstLetterUppercase(value)}
                />
              ))}
          </Select>
        </FormFieldSC>
        <FormFieldSC label="Cloud">
          <Select
            selectedKey={cloud}
            onSelectionChange={(cloud) => setCloud(cloud as CloudProvider)}
          >
            {Object.values(CloudProvider).map((value) => (
              <ListBoxItem
                key={value}
                label={value}
              />
            ))}
          </Select>
        </FormFieldSC>
        {cloud === CloudProvider.Aws && (
          <FormFieldSC label="Region">
            <Select
              selectedKey={region}
              onSelectionChange={(region) => setRegion(region as string)}
            >
              {regions.map((region) => (
                <ListBoxItem
                  key={region}
                  label={region}
                />
              ))}
            </Select>
          </FormFieldSC>
        )}
      </Flex>
      <Confirm
        open={confirm}
        error={error}
        title={`Create cluster`}
        text={`Would you like to proceed with cluster creation?`}
        submit={() => mutation()}
        close={() => setConfirm(false)}
        label="Create cluster"
        loading={loading}
      />
    </>
  )
}

export const FormFieldSC = styled(FormField)(({ theme }) => ({
  color: theme.colors.text,
}))

const FormFieldCaptionSC = styled.span<{
  $name: string
}>(({ theme, $name }) => ({
  ...theme.partials.text.caption,
  color: nameRegex.test($name)
    ? theme.colors['text-success-light']
    : $name !== ''
    ? theme.colors['text-danger-light']
    : theme.colors['text-light'],
}))

const regions = ['us-east-1']
