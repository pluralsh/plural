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

const REGIONS = ['us-east-1']

export function ConfigureCloudInstanceStep() {
  const theme = useTheme()
  const { setCurStep, setContinueBtn, setConsoleInstanceId, hostingOption } =
    useCreateClusterContext()

  const cloud = CloudProvider.Aws
  const region = REGIONS[0]

  const [name, setName] = useState('')
  const [size, setSize] = useState<ConsoleSize>(ConsoleSize.Small)
  const [confirm, setConfirm] = useState(false)

  const [showNameError, setShowNameError] = useState(false)
  const { isNameValid, nameErrorMessage } = validateName(name)

  const canSubmit = !!(name && size)

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
        onClick={() =>
          isNameValid ? setConfirm(true) : setShowNameError(true)
        }
      >
        Continue
      </Button>
    )

    return () => {
      setContinueBtn(undefined)
    }
  }, [canSubmit, isNameValid, setConfirm, setShowNameError, setContinueBtn])

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
          label="Instance name"
          hint={
            showNameError && (
              <ValidationHintSC>{nameErrorMessage}</ValidationHintSC>
            )
          }
        >
          <Input
            placeholder="Enter instance name"
            borderColor={
              name === '' || isNameValid
                ? undefined
                : theme.colors['border-danger']
            }
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
          />
        </FormFieldSC>
        <FormFieldSC label="Instance size">
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
      </Flex>
      <Confirm
        open={confirm}
        error={error}
        title="Create cloud instance"
        text="Would you like to proceed with cloud instance creation?"
        submit={() => mutation()}
        close={() => setConfirm(false)}
        label="Create cloud instance"
        loading={loading}
      />
    </>
  )
}

export const FormFieldSC = styled(FormField)(({ theme }) => ({
  color: theme.colors.text,
}))

const ValidationHintSC = styled.span(({ theme }) => ({
  color: theme.colors['text-danger-light'],
}))

const validateName = (name: string) => {
  const nameValidity = {
    length: name.length >= 5 && name.length <= 15,
    lowercase: !/[A-Z]/.test(name),
    alphanumeric: !!name.match(/^[a-z0-9]+$/),
    startsWithLetter: !!name.at(0)?.match(/[a-z]/),
  }
  return {
    isNameValid: Object.values(nameValidity).every((value) => value),
    nameErrorMessage: !nameValidity.lowercase
      ? 'Name must be lowercase'
      : !nameValidity.startsWithLetter
      ? 'Name must start with a letter'
      : !nameValidity.alphanumeric
      ? 'Name must be alphanumeric'
      : !nameValidity.length
      ? 'Name must be between 5 and 15 characters'
      : '',
  }
}
