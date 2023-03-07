import {
  Key,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  A,
  Button,
  Div,
  DivProps,
  DropdownButton,
  ExtendTheme,
  Flex,
  H2,
  Img,
  MenuItem,
  P,
} from 'honorable'
import {
  ArrowTopRightIcon,
  Codeline,
  DropdownArrowIcon,
  Tab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { Link } from 'react-router-dom'
import capitalize from 'lodash/capitalize'

import { Provider, Recipe, useGetShellQuery } from '../../generated/graphql'

import CurrentUserContext from '../../contexts/CurrentUserContext'

export const providerToDisplayName: Record<Provider, ReactNode> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  EQUINIX: 'Equinix Metal',
  GCP: 'Google',
  KIND: 'Kind',
  CUSTOM: 'Custom',
  KUBERNETES: 'Kubernetes',
  GENERIC: 'Generic',
}

export const providerToIcon: Record<Provider, string | null> = {
  AWS: '/aws-icon.png',
  AZURE: '/azure.png',
  EQUINIX: '/equinix-metal.png',
  GCP: '/gcp.png',
  KIND: '/kind.png',
  CUSTOM: null,
  KUBERNETES: null,
  GENERIC: '/chart.png',
}

export const providerToIconHeight: Record<Provider, number> = {
  AWS: 11,
  AZURE: 14,
  EQUINIX: 16,
  GCP: 14,
  KIND: 14,
  KUBERNETES: 16,
  CUSTOM: 16,
  GENERIC: 14,
}

const visuallyHideMaintainWidth = {
  opacity: '0',
  height: 0,
  'aria-hidden': true,
  pointerEvents: 'none',
} satisfies DivProps

function extendedTheme({ minMenuWidth = 400 }: any) {
  return {
    A: {
      Root: [
        {
          color: 'action-link-inline',
        },
      ],
    },
    DropdownButton: {
      Button: [
        {
          borderRadius: 'normal',
          width: '100%',
        },
      ],
      Menu: [
        {
          backgroundColor: 'fill-two',
          border: '1px solid border-fill-two',
          borderRadius: 'large',
          width: 'max-content',
          minWidth: minMenuWidth,
          maxWidth: 1000,
          left: 'unset',
          marginTop: 'xsmall',
          boxShadow: 'moderate',
        },
      ],
    },
  }
}

function CliCommand({
  recipe,
  type,
  appName,
}: {
  recipe: Recipe
  type: string
  appName: string
}) {
  if (!recipe.provider || !type || !appName) {
    return null
  }

  return (
    <Flex
      flexDirection="column"
      gap="large"
    >
      <Div overline>Install {appName}</Div>
      <Flex
        flexDirection="column"
        gap="small"
      >
        <P
          body2
          bold
          color="text"
        >
          1. Copy the command below:
        </P>
        <Codeline language="bash">
          {`plural ${type} install ${appName} ${recipe.name}`}
        </Codeline>
      </Flex>
      <Div>
        <P
          body2
          bold
          color="text"
        >
          2. Paste and run the command inside of your local Plural repository.
        </P>
      </Div>
    </Flex>
  ) 
}

type InstallDropDownButtonProps = {
  recipes: Recipe[]
  name?: string
  type?: string
  [x: string]: any
}

function RecipeTabs({
  type,
  appName,
  recipes,
}: {
  recipes: Recipe[]
  type: string
  appName: string
}) {
  const [tabKey, setTabKey] = useState<Key>(0)
  const tabStateRef = useRef<any>()
  const currentRecipe = recipes[tabKey] || recipes[0] || null

  useEffect(() => {
    if (!recipes[tabKey]) {
      setTabKey(0)
    }
  }, [recipes, tabKey])

  if (!appName!) {
    return null
  }

  const tabs = recipes
    .filter(recipe => recipe.provider && recipe.name)
    .map((recipe, i) => (
      <Tab
        key={i}
        flexGrow={1}
        {...{ '&>div': { justifyContent: 'center' } }}
      >
        {providerToDisplayName[recipe.provider as Provider]}
      </Tab>
    ))
    .filter(tab => !!tab)

  // return <Div>tab contents</Div>

  return (
    <Div>
      <Flex marginTop="xsmall">
        <TabList
          width="100%"
          stateRef={tabStateRef}
          stateProps={{
            onSelectionChange: key => {
              setTabKey(key)
            },
          }}
        >
          {tabs}
        </TabList>
      </Flex>
      <TabPanel
        stateRef={tabStateRef}
        padding="large"
      >
        {currentRecipe ? (
          <CliCommand
            appName={appName}
            type={type}
            recipe={currentRecipe}
          />
        ) : (
          'Installation not supported for this provider'
        )}
      </TabPanel>
    </Div>
  )
}

function InstallDropdownButton({
  recipes,
  name: appName,
  type = 'bundle',
  ...props
}: InstallDropDownButtonProps) {
  // const { hasInstallations, provider } = useContext(CurrentUserContext)
  const { data, loading } = useGetShellQuery()

  // const hasCloudShell = data?.shell

  // DEBUG VALUES
  const hasCloudShell = false
  const provider = null
  const hasInstallations = true
  // END DEBUG VALUES

  const recipe = recipes.find(recipe => recipe.provider === provider)

  const isCliUser = !hasCloudShell && hasInstallations

  console.log('hasCloudShell', hasCloudShell)

  if (!appName) {
    return null
  }

  return (
    <ExtendTheme theme={extendedTheme({ minMenuWidth: !recipe ? 300 : 470 })}>
      {!isCliUser || loading ? (
        <Button
          primary
          width="100%"
          loading={loading}
          as={Link}
          to={
            type === 'stack'
              ? `/shell?stackName=${appName}&stackProvider=${recipe.provider}`
              : `/shell?appName=${appName}`
          }
        >Install
        </Button>
      ) : (
        <DropdownButton
          fade
          label="Install"
          endIcon={<DropdownArrowIcon size={16} />}
            {...props}
            padding=
        >
          {loading
            ? '...loading'
            : isCliUser
              && (recipe ? (
                <Div padding="large">
                  <CliCommand
                    appName={appName}
                    type={type}
                    recipe={recipe}
                  />
                </Div>
              ) : (
                <RecipeTabs
                  appName={appName}
                  type={type}
                  recipes={recipes}
                />
              ))}
        </DropdownButton>
      )}
    </ExtendTheme>
  )
}

export default InstallDropdownButton
