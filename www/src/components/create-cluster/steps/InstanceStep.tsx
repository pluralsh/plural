import {
  Button,
  Callout,
  Chip,
  Codeline,
  Flex,
  Input,
  ListBoxItem,
  Select,
  Tooltip,
} from '@pluralsh/design-system'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { GqlError } from 'components/utils/Alert'
import {
  CloudProvider,
  ConsoleInstanceType,
  ConsoleSize,
  useCreateConsoleInstanceMutation,
} from 'generated/graphql'
import usePersistedState from 'hooks/usePersistedState'

import { CREATE_CLUSTER_TTL_KEY, HOSTING_OPTION_KEY } from '../constants'
import { CreateClusterActions } from '../CreateClusterActions'
import {
  CloudOption,
  CreateClusterStepKey,
  useCreateClusterContext,
} from '../CreateClusterWizard'
import {
  BodyTextSC,
  FormFieldSC,
  InlineCodeSC,
  OverlineSC,
  RadioSC,
  SectionLabelSC,
  SegmentSC,
  SegmentedSC,
  SubCardSC,
} from '../shared'
import { CONTACT_URL } from '../SupportCard'
import { PLAN_BLOCKED_COPY, usePlanGating } from '../usePlanGating'

const PROVIDERS: { label: string; value?: CloudProvider }[] = [
  { label: 'AWS', value: CloudProvider.Aws },
  { label: 'GCP' },
  { label: 'Azure' },
]

const REGIONS: Record<
  ConsoleInstanceType,
  Partial<Record<CloudProvider, string[]>>
> = {
  [ConsoleInstanceType.Shared]: { [CloudProvider.Aws]: ['us-east-1'] },
  [ConsoleInstanceType.Dedicated]: {
    [CloudProvider.Aws]: ['us-east-1', 'me-central-1'],
  },
}

const regionsFor = (type: ConsoleInstanceType, cloud: CloudProvider) =>
  REGIONS[type][cloud] ?? []

const TENANCY_OPTIONS = [
  {
    value: ConsoleInstanceType.Shared,
    title: 'Shared',
    plan: 'Pro plan',
    description:
      'Runs on shared Plural clusters and databases. Ideal for smaller teams.',
  },
  {
    value: ConsoleInstanceType.Dedicated,
    title: 'Dedicated',
    plan: 'Enterprise plan',
    description:
      'Its own cluster and database, fully isolated. Built for scale and security.',
  },
]

const SIZES = [
  { value: ConsoleSize.Small, label: 'Small' },
  { value: ConsoleSize.Medium, label: 'Medium' },
  { value: ConsoleSize.Large, label: 'Large' },
]

export function InstanceStep() {
  const { cloudOption, setCloudOption, cancel, finish } =
    useCreateClusterContext()
  const { canCreateShared } = usePlanGating()

  return (
    <>
      <SectionLabelSC>Hosting</SectionLabelSC>
      <HostingOptionsSC role="radiogroup">
        <HostingOption
          value="cloud"
          selected={cloudOption}
          onSelect={setCloudOption}
          title="Plural Cloud"
          description={
            canCreateShared
              ? 'Hosted and managed by Plural. Ready in a few minutes. Included in your plan.'
              : 'Hosted and managed by Plural. Needs a Pro plan or an active trial.'
          }
        />
        <HostingOption
          value="local"
          selected={cloudOption}
          onSelect={setCloudOption}
          title="Self-hosted"
          description="Free. Run Plural Console in your own cloud account. You install it with the Plural CLI."
        />
      </HostingOptionsSC>
      {cloudOption === 'cloud' ? (
        <CloudInstanceForm />
      ) : (
        <>
          <SelfHostedInstructions />
          <CreateClusterActions
            start={
              <Button
                destructive
                onClick={cancel}
              >
                Cancel
              </Button>
            }
          >
            <Button onClick={finish}>I've deployed my console</Button>
          </CreateClusterActions>
        </>
      )}
    </>
  )
}

function CloudInstanceForm() {
  const { setCurStep, setConsoleInstanceId, cancel } = useCreateClusterContext()
  const { canCreateShared, canCreateDedicated, blockedReason } = usePlanGating()
  const canCreate: Record<ConsoleInstanceType, boolean> = {
    [ConsoleInstanceType.Shared]: canCreateShared,
    [ConsoleInstanceType.Dedicated]: canCreateDedicated,
  }
  const blocked = blockedReason ? PLAN_BLOCKED_COPY[blockedReason] : null

  const [name, setName] = useState('')
  const [type, setType] = usePersistedState<ConsoleInstanceType>(
    HOSTING_OPTION_KEY,
    ConsoleInstanceType.Shared,
    { key: CREATE_CLUSTER_TTL_KEY }
  )
  const [size, setSize] = useState<ConsoleSize>(ConsoleSize.Small)
  const [cloud, setCloud] = useState<CloudProvider>(CloudProvider.Aws)
  const [region, setRegion] = useState(regionsFor(type, cloud)[0] ?? '')
  const [nameTouched, setNameTouched] = useState(false)

  const regions = regionsFor(type, cloud)
  const { isNameValid, nameErrorMessage } = validateName(name)
  const showNameError = nameTouched && !!name && !isNameValid
  const dedicatedLocked =
    type === ConsoleInstanceType.Dedicated && !canCreateDedicated

  const selectType = (next: ConsoleInstanceType) => {
    setType(next)
    if (!regionsFor(next, cloud).includes(region))
      setRegion(regionsFor(next, cloud)[0] ?? '')
  }

  const [mutation, { loading, error }] = useCreateConsoleInstanceMutation({
    variables: { attributes: { name, cloud, region, size, type } },
    onCompleted: (data) => {
      setConsoleInstanceId(data?.createConsoleInstance?.id)
      setCurStep(CreateClusterStepKey.Build)
    },
  })

  return (
    <>
      {error && <GqlError error={error} />}
      {blocked && (
        <Callout
          severity={blockedReason === 'delinquent' ? 'danger' : 'warning'}
          title={blocked.title}
        >
          <Flex
            direction="column"
            gap="small"
          >
            {blocked.body}
            <div>
              <Button
                small
                secondary
                as={Link}
                to="/account/billing"
              >
                Manage billing
              </Button>
            </div>
          </Flex>
        </Callout>
      )}
      <SubCardSC>
        <FormFieldSC
          required
          label="Tenancy"
        >
          <TenancyOptionsSC role="radiogroup">
            {TENANCY_OPTIONS.map((option) => {
              const locked = !canCreate[option.value]
              const selected = type === option.value

              return (
                <TenancyOptionSC
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={locked || undefined}
                  $selected={selected}
                  $locked={locked}
                  onClick={() => !locked && selectType(option.value)}
                >
                  <RadioSC $selected={selected} />
                  <span className="text">
                    <span className="row">
                      <span className="title">{option.title}</span>
                      {locked && (
                        <Chip
                          size="small"
                          css={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {option.plan}
                        </Chip>
                      )}
                    </span>
                    <span className="description">{option.description}</span>
                  </span>
                </TenancyOptionSC>
              )
            })}
          </TenancyOptionsSC>
        </FormFieldSC>
        {canCreateShared && !canCreateDedicated && (
          <IsolationHintSC>
            Need full isolation?{' '}
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to sales about Enterprise
            </a>
          </IsolationHintSC>
        )}
        <FormFieldSC
          required
          label="Instance name"
          hint={
            showNameError ? (
              <NameErrorSC>{nameErrorMessage}</NameErrorSC>
            ) : (
              'Becomes part of your console URL. We lowercase it as you type. 5–15 letters or numbers, starting with a letter.'
            )
          }
        >
          <Input
            placeholder="acme"
            value={name}
            error={showNameError}
            onBlur={() => setNameTouched(true)}
            onChange={(e) =>
              setName(e.target.value.toLowerCase().replace(/\s/g, ''))
            }
          />
        </FormFieldSC>
        <FieldGridSC>
          <FormFieldSC
            required
            label="Cloud provider"
          >
            <SegmentedSC>
              {PROVIDERS.map(({ label, value }) =>
                value ? (
                  <SegmentSC
                    key={label}
                    type="button"
                    $selected={cloud === value}
                    aria-pressed={cloud === value}
                    onClick={() => {
                      setCloud(value)
                      setRegion(regionsFor(type, value)[0] ?? '')
                    }}
                  >
                    {label}
                  </SegmentSC>
                ) : (
                  <Tooltip
                    key={label}
                    label="Coming soon"
                    placement="top"
                  >
                    <SegmentSC
                      type="button"
                      $selected={false}
                      aria-disabled
                    >
                      {label}
                    </SegmentSC>
                  </Tooltip>
                )
              )}
            </SegmentedSC>
          </FormFieldSC>
          <FormFieldSC
            required
            label="Region"
            hint="Pick the region closest to your clusters."
          >
            <Select
              label="Region"
              selectedKey={region}
              onSelectionChange={(key) => setRegion(`${key}`)}
            >
              {regions.map((r) => (
                <ListBoxItem
                  key={r}
                  label={r}
                />
              ))}
            </Select>
          </FormFieldSC>
          <FormFieldSC
            required
            label="Instance size"
            hint="Start small. You can resize later from the instance settings."
          >
            <Select
              label="Instance size"
              selectedKey={size}
              onSelectionChange={(key) => setSize(key as ConsoleSize)}
            >
              {SIZES.map(({ value, label }) => (
                <ListBoxItem
                  key={value}
                  label={label}
                />
              ))}
            </Select>
          </FormFieldSC>
        </FieldGridSC>
      </SubCardSC>
      <Flex
        direction="column"
        gap="xsmall"
      >
        <OverlineSC>What happens next</OverlineSC>
        <BodyTextSC>
          We build your instance in a few minutes. You can close the tab once it
          starts and check progress from Instances.
        </BodyTextSC>
      </Flex>
      <CreateClusterActions
        start={
          <Button
            destructive
            onClick={cancel}
          >
            Cancel
          </Button>
        }
      >
        <Button
          disabled={!isNameValid || !canCreateShared || dedicatedLocked}
          loading={loading}
          onClick={() => mutation()}
        >
          Create instance
        </Button>
      </CreateClusterActions>
    </>
  )
}

function SelfHostedInstructions() {
  return (
    <SubCardSC>
      <Flex
        direction="column"
        gap="xsmall"
      >
        <CliStepLabelSC>1. Install the Plural CLI</CliStepLabelSC>
        <Codeline>brew install pluralsh/plural/plural</Codeline>
      </Flex>
      <Flex
        direction="column"
        gap="xsmall"
      >
        <CliStepLabelSC>2. Deploy Console to your cloud</CliStepLabelSC>
        <Codeline>plural up</Codeline>
        <CaptionTextSC>
          Sets up a GitOps repo and a management cluster running Console in your
          own account. Takes about 10 minutes (longer on AWS).
        </CaptionTextSC>
      </Flex>
      <BodyTextSC>
        Run <InlineCodeSC>plural up</InlineCodeSC> from an empty directory. See
        the setup guide for prerequisites and cloud credentials.
      </BodyTextSC>
    </SubCardSC>
  )
}

function HostingOption({
  value,
  selected,
  onSelect,
  title,
  description,
}: {
  value: CloudOption
  selected: CloudOption
  onSelect: (value: CloudOption) => void
  title: string
  description: string
}) {
  const isSelected = value === selected

  return (
    <HostingOptionSC
      type="button"
      role="radio"
      aria-checked={isSelected}
      $selected={isSelected}
      onClick={() => onSelect(value)}
    >
      <RadioSC $selected={isSelected} />
      <span className="text">
        <span className="title">{title}</span>
        <span className="description">{description}</span>
      </span>
    </HostingOptionSC>
  )
}

const validateName = (name: string) => {
  const validity = {
    length: name.length >= 5 && name.length <= 15,
    allowedChars: /^[a-z0-9]+$/.test(name),
    startsWithLetter: /^[a-z]/.test(name),
  }

  return {
    isNameValid: Object.values(validity).every(Boolean),
    nameErrorMessage: !validity.startsWithLetter
      ? 'Name must start with a letter'
      : !validity.allowedChars
        ? 'Letters and numbers only'
        : !validity.length
          ? 'Name must be between 5 and 15 characters'
          : '',
  }
}

const HostingOptionsSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
  gap: theme.spacing.small,
  marginTop: -theme.spacingPx.small,
}))

const HostingOptionSC = styled.button<{ $selected: boolean }>(
  ({ theme, $selected }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.small,
    padding: theme.spacing.medium,
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: theme.borderRadiuses.medium,
    border: $selected ? theme.borders.input : theme.borders.default,
    backgroundColor: 'transparent',
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
    '.text': { display: 'flex', flexDirection: 'column', gap: 4 },
    '.title': { ...theme.partials.text.body1Bold, color: theme.colors.text },
    '.description': {
      ...theme.partials.text.body2,
      color: theme.colors['text-light'],
    },
  })
)

const TenancyOptionsSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
  gap: theme.spacing.xsmall,
}))

const TenancyOptionSC = styled.button<{ $selected: boolean; $locked: boolean }>(
  ({ theme, $selected, $locked }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.small,
    padding: theme.spacing.small,
    textAlign: 'left',
    cursor: $locked ? 'not-allowed' : 'pointer',
    opacity: $locked ? 0.6 : 1,
    borderRadius: theme.borderRadiuses.medium,
    border: $selected ? theme.borders.input : theme.borders.default,
    backgroundColor: 'transparent',
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
    '.text': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.xxsmall,
      flex: 1,
      minWidth: 0,
    },
    '.row': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xsmall,
    },
    '.title': { ...theme.partials.text.body2Bold, color: theme.colors.text },
    '.description': {
      ...theme.partials.text.caption,
      color: theme.colors['text-light'],
    },
  })
)

const IsolationHintSC = styled(BodyTextSC)(({ theme }) => ({
  ...theme.partials.text.caption,
  marginTop: -8,
  a: theme.partials.text.inlineLink,
}))

const NameErrorSC = styled.span(({ theme }) => ({
  color: theme.colors['text-danger-light'],
}))

const FieldGridSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
  gap: theme.spacing.medium,
}))

const CliStepLabelSC = styled(SectionLabelSC)(({ theme }) => ({
  ...theme.partials.text.body2Bold,
}))

const CaptionTextSC = styled(BodyTextSC)(({ theme }) => ({
  ...theme.partials.text.caption,
}))
