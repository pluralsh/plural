import {
  Key,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Div,
  Flex,
  H2,
  ModalBaseProps,
  P,
} from 'honorable'
import {
  Codeline,
  Modal,
  Tab,
  TabList,
  TabPanel,
  Tooltip,
} from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import isEmpty from 'lodash/isEmpty'

import ClustersContext from '../../contexts/ClustersContext'
import { Cluster, Provider } from '../../generated/graphql'

import { useCurrentUser } from '../../contexts/CurrentUserContext'

import { useShellType } from '../../hooks/useShellType'

import {
  InstallAppButtonProps,
  RecipeSubset,
  RecipeType,
  getInstallCommand,
  providerToLongName,
  providerToShortName,
} from './recipeHelpers'
import { CloudShellClusterPicker } from './ClusterPicker'

function CliCommand({
  recipe,
  type,
  name,
}: {
  recipe: RecipeSubset
  type: RecipeType
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
      {/* <Div overline>Install {name}</Div> */}
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
          {getInstallCommand({ type, name, recipe })}
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
  type: RecipeType
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
        {providerToShortName[recipe.provider as Provider]}
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

function InstallAppButton({
  loading = false,
  ...props
}: InstallAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { provider } = useCurrentUser()
  const isCliUser = useShellType() === 'cli'
  const { clusters } = useContext(ClustersContext)

  // DEBUG VALS

  // const isCliUser = false
  // const clusters = []

  // END DEBUG VALS

  const {
    recipes, type, name, apps,
  } = props
  const recipe
    = type === 'stack' && !provider
      ? recipes?.[0]
      : recipes?.find(recipe => recipe.provider === provider)

  if (!name) {
    return null
  }

  let button = (
    <Button
      primary
      width="100%"
      loading={isOpen && loading}
      onClick={() => {
        setIsOpen(true)
      }}
    >
      Install
    </Button>
  )

  if (isEmpty(clusters)) {
    if (!isCliUser) {
      button = (
        <Button
          primary
          width="100%"
          loading={loading}
          as={Link}
          to={`/shell?install=${
            apps && !isEmpty(apps) ? `${apps.join(',')}` : name
          }`}
        >
          Install
        </Button>
      )
    }
    else if (!recipe && provider) {
      button = (
        <Tooltip
          label={`This ${
            props.type === 'bundle' ? 'app' : 'stack'
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
      )
    }
  }

  return (
    <>
      {button}
      <InstallModal
        open={isOpen && !loading}
        onClose={() => setIsOpen(false)}
        isCliUser={isCliUser}
        clusters={clusters}
        {...props}
      />
    </>
  )
}

function InstallModal({
  recipes,
  name,
  type = 'bundle',
  apps,
  isCliUser,
  clusters,
  ...props
}: Omit<InstallAppButtonProps, 'loading'> & {
  isCliUser: boolean
  clusters: Cluster[]
} & ModalBaseProps) {
  const { provider } = useCurrentUser()

  const recipe
    = type === 'stack' && !provider
      ? recipes?.[0]
      : recipes?.find(recipe => recipe.provider === provider)

  const [cluster, setCluster] = useState<Cluster | undefined>(!isEmpty(clusters) ? clusters[0] : undefined)

  const showClusters = !isEmpty(clusters)
  const header = showClusters
    ? undefined
    : isCliUser && recipe
      ? `Install ${name}`
      : undefined
  const spacing
    = isCliUser && !recipe
      ? {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }
      : {}

  return (
    <Modal
      size={showClusters ? 'medium' : 'large'}
      header={header}
      {...props}
      {...spacing}
    >
      {showClusters ? (
        <Flex
          direction="column"
          gap="large"
        >
          <Flex
            direction="column"
            gap="xsmall"
          >
            <H2
              body2
              bold
            >
              Select a cluster for installation
            </H2>
            <CloudShellClusterPicker
              cluster={cluster}
              setCluster={setCluster}
              size="small"
            />
          </Flex>
          <Button
            primary
            width="100%"
            as={Link}
            to={`/shell?cluster=${cluster?.id}&install=${
              apps && !isEmpty(apps) ? `${apps.join(',')}` : name
            }`}
          >
            Start install
          </Button>
        </Flex>
      ) : recipe ? (
        /* CLI user: If there is a recipe for the user's provider, show it in a dropdown */
        <CliCommand
          name={name}
          type={type}
          recipe={recipe}
        />
      ) : (
        /* Final fallback: Show recipes for all providers */
        <RecipeTabs
          name={name}
          type={type}
          recipes={recipes}
        />
      )}
    </Modal>
  )
}

export default InstallAppButton
