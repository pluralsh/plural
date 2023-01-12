import { Div, Flex, P } from 'honorable'
import {
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  AppsIcon,
  FormField,
  Input,
  InstallIcon,
  LoopingLogo,
  Wizard,
  WizardInstaller,
  WizardNavigation,
  WizardPicker,
  WizardStep,
  WizardStepConfig,
  WizardStepper,
  useActive,
} from '@pluralsh/design-system'
import { useQuery } from '@apollo/client'

import { EXPLORE_REPOS } from '../../../../repos/queries'

interface FormData {
  domain: string
}

function Application({ ...props }: any): ReactElement {
  const { active, setData } = useActive<FormData>()
  const [domain, setDomain] = useState<string>(active?.data?.domain ?? '')

  // Build our form data
  const data = useMemo<FormData>(() => ({ domain }), [domain])

  // Update step data on change
  useEffect(() => setData(data), [domain, setData, data])

  return (
    <WizardStep
      valid={domain.length > 0}
      data={data}
      {...props}
    >
      <P
        overline
        color="text-xlight"
        paddingBottom="medium"
      >configure {active.label}
      </P>
      <FormField
        label="Domain"
        required
      >
        <Input
          placeholder="https://{domain}.onplural.sh"
          value={domain}
          onChange={event => setDomain(event.target.value)}
        />
      </FormField>
    </WizardStep>
  )
}

const toPickerItems = (applications): Array<WizardStepConfig> => applications?.map(app => ({
  key: app.id,
  label: app.name,
  imageUrl: app.icon,
  node: <Application key={app.id} />,
})) || []

const toDefaultSteps = (applications): Array<WizardStepConfig> => [{
  key: 'apps',
  label: 'Apps',
  Icon: AppsIcon,
  node: <WizardPicker items={toPickerItems(applications)} />,
  isDefault: true,
},
{
  key: 'placeholder',
  isPlaceholder: true,
},
{
  key: 'install',
  label: 'Install',
  Icon: InstallIcon,
  node: <WizardInstaller />,
  isDefault: true,
}]

function Installer() {
  // const [open, setOpen] = useState(true)
  // const [confirmClose, setConfirmClose] = useState(false)
  // const [visible, setVisible] = useState(false)
  // const [inProgress, setInProgress] = useState<boolean>(false)
  const { data: { repositories: { edges: applicationNodes } = { edges: undefined } } = {} } = useQuery(EXPLORE_REPOS)
  const applications = applicationNodes?.map(({ node }) => node).filter(app => !app?.private ?? true)

  if (!applications) {
    return (
      <Flex
        flexGrow={0}
        width={600}
        align="center"
        justify="center"
        borderRight="1px solid border"
        padding="medium"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <Div
      width={600}
      borderRight="1px solid border"
      padding="medium"
    >
      <Wizard
        // onComplete={completed => setInProgress(completed)}
        defaultSteps={toDefaultSteps(applications)}
        limit={5}
      >
        {{
          stepper: <WizardStepper />,
          navigation: <WizardNavigation onInstall={() => {
            // setOpen(false)
            // setVisible(true)
          }}
          />,
        }}
      </Wizard>
    </Div>
  )
}

export default Installer
