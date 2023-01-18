import { Div, Flex } from 'honorable'
import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  HamburgerMenuCollapseIcon,
  HamburgerMenuIcon,
  IconFrame,
  LoopingLogo,
  Wizard,
  WizardNavigation,
  WizardStepConfig,
  WizardStepper,
} from '@pluralsh/design-system'
import { useApolloClient, useQuery } from '@apollo/client'

import { TerminalContext } from '../context/terminal'

import { APPLICATIONS_QUERY } from './queries'
import { buildSteps, install, toDefaultSteps } from './helpers'

const FILTERED_APPS = ['bootstrap', 'ingress-nginx', 'postgres']

function Installer() {
  const client = useApolloClient()
  const { shell: { provider }, configuration } = useContext(TerminalContext)
  const onResetRef = useRef<{onReset: Dispatch<void>}>({ onReset: () => {} })
  const [selectedApplications, setSelectedApplications] = useState<Array<WizardStepConfig>>([])
  const [stepsLoading, setStepsLoading] = useState(false)
  const [steps, setSteps] = useState<Array<WizardStepConfig>>([])
  const [visible, setVisible] = useState(true)

  const { data: { repositories: { edges: applicationNodes } = { edges: undefined } } = {} } = useQuery(APPLICATIONS_QUERY, {
    variables: { provider },
    skip: !provider,
  })
  const applications = applicationNodes?.map(({ node }) => node).filter(app => (!app?.private ?? true) && !FILTERED_APPS.includes(app?.name))

  const onInstall = useCallback((payload: Array<WizardStepConfig>) => {
    setStepsLoading(true)

    install(client, payload, provider)
      .then(() => {
        onResetRef?.current?.onReset()
        setVisible(false)
      })
      .catch(err => console.error(err))
      .finally(() => setStepsLoading(false))
  }, [client, provider])

  useEffect(() => {
    const build = async () => {
      const steps = await buildSteps(client, provider, selectedApplications)

      setSteps(steps)
    }

    setStepsLoading(true)
    build().then(() => setStepsLoading(false))
  }, [client, selectedApplications.length, provider])

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
      padding="medium"
      borderRight="1px solid border"
    >
      <Div
        width={!visible ? 32 : 0}
        height={!visible ? '100%' : 0}
        opacity={!visible ? 1 : 0}
        visibility={!visible ? 'visible' : 'collapse'}
        transition="opacity 650ms linear"
        style={{ position: 'absolute' }}
      >
        <IconFrame
          icon={<HamburgerMenuIcon />}
          clickable
          onClick={() => setVisible(!visible)}
        />
      </Div>
      <Div
        width={visible ? 600 : 32}
        height="100%"
        opacity={visible ? 1 : 0}
        visibility={visible ? 'visible' : 'collapse'}
        transition="width 300ms linear, opacity 150ms linear"
      >
        <Wizard
          onSelect={apps => setSelectedApplications(apps)}
          defaultSteps={toDefaultSteps(applications, provider)}
          dependencySteps={steps}
          limit={5}
          loading={stepsLoading || !configuration}
          onResetRef={onResetRef}
        >
          {{
            stepper: (
              <Flex
                grow={1}
                align="center"
                justify="space-between"
                width="100%"
                gap="xsmall"
              >
                <WizardStepper />
                <IconFrame
                  icon={<HamburgerMenuCollapseIcon />}
                  clickable
                  onClick={() => setVisible(!visible)}
                />
              </Flex>
            ),
            navigation: <WizardNavigation onInstall={onInstall} />,
          }}
        </Wizard>
      </Div>
    </Div>
  )
}

export default Installer
