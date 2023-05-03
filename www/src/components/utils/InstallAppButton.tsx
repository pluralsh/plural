import {
  Key,
  useContext,
  useEffect,
  useMemo,
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
} from '@pluralsh/design-system'
import { Link } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import upperFirst from 'lodash/upperFirst'

import ClustersContext from '../../contexts/ClustersContext'
import { Cluster, Provider } from '../../generated/graphql'
import { useCurrentUser } from '../../contexts/CurrentUserContext'

import {
  InstallAppButtonProps,
  RecipeSubset,
  RecipeType,
  getInstallCommand,
  providerToLongName,
  providerToShortName,
} from './recipeHelpers'
import {
  CloudShellClusterPicker,
  NEW_CLUSTER_ID,
  clusterFilter,
  clusterHasCloudShell,
} from './ClusterPicker'

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
  const { id: userId } = useCurrentUser()
  const { clusters } = useContext(ClustersContext)
  const filteredClusters = useMemo(() => clusters.filter(cluster => clusterFilter(cluster, userId, { showCliClusters: true })),
    [clusters, userId])
  const { name, apps } = props

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

  if (isEmpty(filteredClusters)) {
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

  return (
    <>
      {button}
      <InstallModal
        open={isOpen && !loading}
        onClose={() => setIsOpen(false)}
        clusters={filteredClusters}
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
  clusters,
  onClose,
  ...props
}: Omit<InstallAppButtonProps, 'loading'> & {
  clusters: Cluster[]
} & ModalBaseProps) {
  const [clusterId, setClusterId] = useState<string | undefined>(!isEmpty(clusters) ? clusters[0].id : undefined)

  const currentCluster = useMemo(() => clusters.find(cl => cl.id === clusterId), [clusterId, clusters])
  const clusterProvider = currentCluster?.provider

  const isCloudShellCluster
    = clusterId === NEW_CLUSTER_ID
    || (currentCluster && clusterHasCloudShell(currentCluster))
  const header = `Install ${name}`
  const recipe
    = type === 'stack' && !clusterProvider
      ? recipes?.[0]
      : recipes?.find(recipe => recipe.provider === clusterProvider)

  return (
    <Modal
      size="large"
      header={header}
      onClose={onClose}
      {...props}
    >
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
            clusterId={clusterId}
            showCliClusters
            onChange={setClusterId}
            size="small"
          />
        </Flex>
        {!isCloudShellCluster
          && (recipe ? (
            <CliCommand
              name={name}
              type={type}
              recipe={recipe}
            />
          ) : (
            <>
              <P body2>
                {upperFirst(name)} is not available for this cluster’s provider
                {clusterProvider && (
                  <>, {providerToLongName[clusterProvider]}</>
                )}
                . You may try creating a new cluster with one of the providers below.
                below.
              </P>
              <RecipeTabs
                name={name}
                type={type}
                recipes={recipes}
              />
            </>
          ))}
        {isCloudShellCluster ? (
          <Button
            primary
            width="100%"
            as={Link}
            to={`/shell?${
              clusterId !== NEW_CLUSTER_ID ? `cluster=${clusterId}` : ''
            }&install=${apps && !isEmpty(apps) ? `${apps.join(',')}` : name}`}
          >
            Start install
          </Button>
        ) : (
          <Button
            primary
            width="100%"
            onClick={onClose}
          >
            Done
          </Button>
        )}
      </Flex>
    </Modal>
  )
}

export default InstallAppButton
