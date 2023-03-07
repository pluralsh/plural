import {
  Key,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Div,
  DropdownButton,
  ExtendTheme,
  Flex,
  P,
} from 'honorable'
import {
  Codeline,
  DropdownArrowIcon,
  Tab,
  TabList,
  TabPanel,
  Tooltip,
} from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import { Provider, Recipe, useGetShellQuery } from '../../generated/graphql'
import { useCurrentUser } from '../../contexts/CurrentUserContext'

type RecipeSubset = Pick<Recipe, 'provider' | 'description'> &
  Partial<Pick<Recipe, 'name'>>

type InstallDropDownButtonProps = {
  loading: boolean
  recipes?: RecipeSubset[]
  name: string
  type: 'bundle' | 'stack'
  apps?: string[]
  [x: string]: any
}

const providerToTabName: Record<Provider, ReactNode> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  EQUINIX: 'Equinix',
  GCP: 'GCP',
  KIND: 'Kind',
  CUSTOM: 'Custom',
  KUBERNETES: 'Kubernetes',
  GENERIC: 'Generic',
}

const providerToLongName: Record<Provider, ReactNode> = {
  AWS: 'Amazon Web Services',
  AZURE: 'Microsoft Azure',
  EQUINIX: 'Equinix Metal',
  GCP: 'Google Cloud Platform',
  KIND: 'Kind',
  CUSTOM: 'Custom',
  KUBERNETES: 'Kubernetes',
  GENERIC: 'Generic',
}

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
          borderRadius: 'medium',
          width: 'max-content',
          minWidth: minMenuWidth,
          maxWidth: 1000,
          left: 'unset',
          marginTop: 'xsmall',
          boxShadow: 'moderate',
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 0,
          paddingLeft: 0,
        },
      ],
    },
  }
}

function CliCommand({
  recipe,
  type,
  name,
}: {
  recipe: RecipeSubset
  type: string
  name: string
}) {
  if (!recipe.provider || !type || !name) {
    return null
  }

  return (
    <Flex
      flexDirection="column"
      gap="large"
    >
      <Div overline>Install {name}</Div>
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
          {`plural ${type} install ${name}${
            recipe.name ? ` ${recipe.name}` : ''
          }`}
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

function RecipeTabs({
  type,
  name,
  recipes,
}: {
  recipes: RecipeSubset[]
  type: string
  name: string
}) {
  const [tabKey, setTabKey] = useState<Key>(0)
  const tabStateRef = useRef<any>()
  const currentRecipe = recipes[tabKey] || recipes[0] || null

  useEffect(() => {
    if (!recipes[tabKey]) {
      setTabKey(0)
    }
  }, [recipes, tabKey])

  if (!name!) {
    return null
  }

  const tabs = recipes
    .filter(recipe => recipe.provider)
    .map((recipe, i) => (
      <Tab
        key={i}
        flexGrow={1}
        {...{ '&>div': { justifyContent: 'center' } }}
      >
        {providerToTabName[recipe.provider as Provider]}
      </Tab>
    ))
    .filter(tab => !!tab)

  return (
    <Div>
      <Flex>
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
            name={name}
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
  name,
  type = 'bundle',
  loading: loadingProp = false,
  apps,
  ...props
}: InstallDropDownButtonProps) {
  const { data: shellData, loading: loadingShell } = useGetShellQuery()
  const { hasInstallations, provider } = useCurrentUser()
  const hasCloudShell = !!shellData?.shell
  const loading = loadingProp || loadingShell

  const recipe
    = type === 'stack' && !provider
      ? recipes?.[0]
      : recipes?.find(recipe => recipe.provider === provider)

  const isCliUser = !hasCloudShell && hasInstallations

  if (!name) {
    return null
  }
  if (loading) {
    return (
      <Button
        primary
        width="100%"
        loading
      >
        Install
      </Button>
    )
  }
  if (!recipes || recipes?.length === 0) {
    return null
  }

  return (
    <ExtendTheme theme={extendedTheme({ minMenuWidth: !recipe ? 300 : 470 })}>
      {
        /* All non-CLI users are redirected to the Cloud Shell with app(s) preselected */
        /* A CLI user is defined as a user with installed apps, but no Cloud Shell */
        !isCliUser ? (
          <Button
            primary
            width="100%"
            loading={loading}
            as={Link}
            to={
              type === 'stack'
                ? `/shell${
                  apps && apps.length > 0 ? `?install=${apps.join(',')}` : ''
                }`
                : `/shell?install=${name}`
            }
          >
            Install
          </Button>
        ) /* CLI user: If user has a provider, but there is no recipe for the provider, show a disabled button */
          : !recipe && provider ? (
            <Tooltip
              label={`This ${
                type === 'bundle' ? 'app' : 'stack'
              } is not available for your provider, ${
                providerToLongName[provider]
              }`}
            >
              <span>
                <Button
                  primary
                  width="100%"
                  disabled
                >
                  Install
                </Button>
              </span>
            </Tooltip>
          ) : (
            <DropdownButton
              fade
              label="Install"
              endIcon={<DropdownArrowIcon size={16} />}
              {...props}
            >
              {recipe ? (
              /* CLI user: If there is a recipe for the user's provider, show it in a dropdown */
                <Div padding="large">
                  <CliCommand
                    name={name}
                    type={type}
                    recipe={recipe}
                  />
                </Div>
              ) : (
              /* CLI user: If the user has no provider, then show all recipes in tabs in the dropdown  */
                <RecipeTabs
                  name={name}
                  type={type}
                  recipes={recipes}
                />
              )}
            </DropdownButton>
          )
      }
    </ExtendTheme>
  )
}

export default InstallDropdownButton
