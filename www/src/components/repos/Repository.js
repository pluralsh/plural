import React, { useState, useContext, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { Lock } from 'grommet-icons'
import { useQuery, useMutation } from 'react-apollo'
import { useParams, useHistory } from 'react-router-dom'
import { Scroller, Button, SecondaryButton, Modal, ModalHeader, Tabs, TabHeader,
        TabHeaderItem, TabContent, BORDER_COLOR, ScrollableContainer } from 'forge-core'
import yaml from 'js-yaml'
import { REPO_Q, UPDATE_REPO } from './queries'
import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON, DEFAULT_DKR_ICON, Categories } from './constants'
import Installation from './Installation'
import CreateTerraform from './CreateTerraform'
import { RepoForm } from './CreateRepository'
import Highlight from 'react-highlight'
import Recipes from './Recipes'
import moment from 'moment'
import { Provider } from './misc'
import Artifacts from './Artifacts'
import AceEditor from "react-ace"
import Integrations from './Integrations'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { extendConnection } from '../../utils/graphql'
import { PluralConfigurationContext } from '../login/CurrentUser'
import { RepoView, ViewToggle } from './ViewToggle'
import { Rollouts } from '../upgrades/Rollouts'
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"

function Container({children, onClick, hasNext, noPad}) {
  return (
    <Box
      onClick={onClick}
      focusIndicator={false}
      hoverIndicator='tone-light'
      pad={noPad ? null : 'small'}
      direction='row'
      border={hasNext ? {side: 'bottom', color: BORDER_COLOR} : null}
      gap='small'>
      {children}
    </Box>
  )
}

function Chart({chart, hasNext}) {
  let history = useHistory()
  return (
    <Container onClick={() => history.push(`/charts/${chart.id}`)} hasNext={hasNext}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={chart.icon || DEFAULT_CHART_ICON} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Box direction='row' gap='xsmall' align='center'>
          <Text size='small' weight={500}>
            {chart.name}
          </Text>
          {chart.dependencies && chart.dependencies.application && (
            <Box round='xsmall' pad={{vertical: '3px', horizontal: '5px'}} background='light-4'>
              <Text size='12px'>APP</Text>
            </Box>
          )}
        </Box>
        <Text size='small'>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </Text>
      </Box>
    </Container>
  )
}

function DockerRepository({docker, repo, hasNext}) {
  const {registry} = useContext(PluralConfigurationContext)
  let history = useHistory()
  return (
    <Container hasNext={hasNext} onClick={() => history.push(`/dkr/repo/${docker.id}`)}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_DKR_ICON} />
      </Box>
      <Box justify='center'>
        <Text size='small' weight={500}>
          {docker.name}
        </Text>
        <Text size='small'>
          docker pull {registry}/{repo.name}/{docker.name} -- created {moment(docker.insertedAt).fromNow()}
        </Text>
      </Box>
    </Container>
  )
}

function Tf({terraform, hasNext}) {
  let history = useHistory()

  return (
    <Container onClick={() => history.push(`/terraform/${terraform.id}`)} hasNext={hasNext}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_TF_ICON} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Box direction='row' align='center' gap='xsmall'>
          <Text size='small' weight={500}>
            {terraform.name}
          </Text>
          {terraform.dependencies && terraform.dependencies.providers && terraform.dependencies.providers.map((provider) => <Provider provider={provider} width={15} />)}
        </Box>
        <Text size='small'>
          {terraform.latestVersion} {terraform.description && `- ${terraform.description}`}
        </Text>
      </Box>
    </Container>
  )
}

function Charts({edges, pageInfo, fetchMore}) {
  return (
    <Scroller id='charts'
      edges={edges}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => <Chart key={node.id} chart={node} hasNext={!!next.node} />}
      emptyState={<EmptyTab text='No charts uploaded yet' />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {chartCursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {charts}}) => extendConnection(prev, charts, 'charts')
      })} />
  )
}

function Terraform({edges, pageInfo, fetchMore}) {
  return (
    <Scroller id='terraform'
      edges={edges}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => <Tf key={node.id} terraform={node} hasNext={!!next.node} />}
      emptyState={<EmptyTab text='no terraform modules uploaded yet' />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {tfCursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {terraform}}) => extendConnection(prev, terraform, 'terraform')
      })} />
  )
}

function EmptyTab({text}) {
  return (
    <Box pad='small'>
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function DockerRepos({edges, repo, pageInfo, fetchMore}) {
  return (
    <Scroller id='docker'
      edges={edges}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => (
        <DockerRepository
          key={node.id}
          docker={node}
          repo={repo}
          hasNext={!!next.node} />
      )}
      emptyState={<EmptyTab text='no repos created yet' />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {dkrCursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {dockerRepositories: dkr}}) => extendConnection(prev, dkr, 'dockerRepositories')
      })} />
  )
}

function TerraformCreateModal({repositoryId}) {
  return (
    <Modal target={<SecondaryButton round='xsmall' label='Create' />}>
    {setOpen => (
      <Box width='40vw'>
        <ModalHeader text='Create Terraform Module' setOpen={setOpen} />
        <Box pad='small'>
        <CreateTerraform repositoryId={repositoryId} onCreate={() => setOpen(false)} />
        </Box>
      </Box>
    )}
    </Modal>
  )
}

function RepoCredentials({publicKey}) {
  return (
    <Box pad='small'>
      <Highlight language='plaintext'>
        {publicKey}
      </Highlight>
    </Box>
  )
}

function buildAttributes(attrs, image, darkImage) {
  let attributes = {...attrs}
  if (image) {
    attributes['icon'] = image.file
  }  

  if (darkImage) {
    attributes['darkIcon'] = darkImage.file
  }

  return attributes
}

function RepoUpdate({repository}) {
  const [state, setState] = useState({
    name: repository.name,
    description: repository.description,
    tags: repository.tags.map(({tag}) => tag),
    private: repository.private,
    category: repository.category || Categories.DEVOPS
  })
  const [image, setImage] = useState(null)
  const [darkImage, setDarkImage] = useState(null)
  const attributes = {...state, tags: state.tags.map((t) => ({tag: t}))}
  const [mutation, {loading}] = useMutation(UPDATE_REPO, {
    variables: {id: repository.id, attributes: buildAttributes(attributes, image, darkImage)},
    update: (cache, { data: { updateRepository } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q, variables: {repositoryId: repository.id}, data: {
        ...prev, repository: { ...prev.repository, ...updateRepository }
      }})
    }
  })
  return (
    <RepoForm
      label={`Update ${repository.name}`}
      state={state}
      setState={setState}
      image={image}
      setImage={setImage}
      darkImage={darkImage}
      setDarkImage={setDarkImage}
      mutation={mutation}
      loading={loading}
      update
      />
  )
}

function UpdateSecrets({repository}) {
  const [secrets, setSecrets] = useState(yaml.safeDump(repository.secrets || {}, null, 2))
  const [mutation, {loading}] = useMutation(UPDATE_REPO, {
    variables: {id: repository.id, attributes: {secrets}},
    update: (cache, { data: { updateRepository } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q, variables: {repositoryId: repository.id}, data: {
        ...prev,
        repository: {
          ...prev.repository,
          ...updateRepository
        }
      }})
    }
  })

  return (
    <Box pad='small' gap='small'>
      <AceEditor mode='yaml' theme='terminal' height='300px' width='100%' name='secrets'
        value={secrets} onChange={setSecrets} showGutter showPrintMargin
        highlightActiveLine editorProps={{ $blockScrolling: true }} />
      <Box direction='row' justify='end'>
        <Button loading={loading} label='Save' onClick={mutation} />
      </Box>
    </Box>
  )
}

export function RepositoryIcon({size, repository, headingSize}) {
  return (
    <Box direction='row' align='center' gap='small' fill='horizontal'>
      <Box width={size} height={size} flex={false}>
        <img alt='' width={size} height={size} src={repository.icon} />
      </Box>
      <Box pad='small' flex={false}>
        <Box direction='row' gap='xsmall' align='center'>
          <Text weight='bold' size={headingSize}>{repository.name}</Text>
          {repository.private && <Lock size='small' />}
        </Box>
        <Text size='small' color='dark-3'>{repository.description}</Text>
      </Box>
    </Box>
  )
}

const IMG_SIZE = '75px'
const WIDTH = 65

function DetailView({repository, terraform, dockerRepositories, charts, fetchMore}) {
  const [tab, setTab] = useState(null)
  return (
    <Tabs
      defaultTab='charts'
      onTabChange={setTab}
      headerEnd={tab === 'terraform' && repository.editable ? <TerraformCreateModal /> : null}>
      <TabHeader>
        <TabHeaderItem name='charts'>
          <Text weight={500} size='small'>Charts</Text>
        </TabHeaderItem>
        <TabHeaderItem name='terraform'>
          <Text weight={500} size='small'>Terraform</Text>
        </TabHeaderItem>
        <TabHeaderItem name='docker'>
          <Text weight={500} size='small'>Docker</Text>
        </TabHeaderItem>
        {repository.publicKey && (
          <TabHeaderItem name='credentials'>
            <Text weight={500} size='small'>Credentials</Text>
          </TabHeaderItem>
        )}
        {repository.editable && (
          <TabHeaderItem name='secrets'>
            <Text weight={500} size='small'>Secrets</Text>
          </TabHeaderItem>
        )}
        {repository.editable && (
          <TabHeaderItem name='edit'>
            <Text weight={500} size='small'>Edit</Text>
          </TabHeaderItem>
        )}
      </TabHeader>
      <TabContent name='charts'>
        <Charts {...charts} fetchMore={fetchMore} />
      </TabContent>
      <TabContent name='terraform'>
        <Terraform {...terraform} fetchMore={fetchMore} />
      </TabContent>
      <TabContent name='docker'>
        <DockerRepos repo={repository} {...dockerRepositories} fetchMore={fetchMore} />
      </TabContent>
      <TabContent name='credentials'>
        <RepoCredentials {...repository} />
      </TabContent>
      <TabContent name='secrets'>
        <UpdateSecrets repository={repository} />
      </TabContent>
      <TabContent name='edit'>
        <RepoUpdate repository={repository} />
      </TabContent>
    </Tabs>
  )
}

export default function Repository() {
  const {repositoryId} = useParams()
  const {loading, data, fetchMore} = useQuery(REPO_Q, {
    variables: {repositoryId},
    fetchPolicy: "cache-and-network"
  })
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  const [view, setView] = useState(RepoView.PKG)

  useEffect(() => {
    if (!data) return
    if (data.recipes && data.recipes.edges.length > 0) setView(RepoView.RECIPE)
    const {repository} = data

    setBreadcrumbs([
      {url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name},
      {url: `/repositories/${repository.id}`, text: repository.name}
    ])
  }, [setBreadcrumbs, data, setView])

  if (loading) return null
  const {charts, repository, terraform, dockerRepositories, recipes, integrations} = data

  return (
    <ScrollableContainer>
      <Box pad='small' direction='row' fill='vertical'>
        <Box pad='small' width={`${WIDTH}%`} fill='vertical'>
          <Box flex={false} fill='horizontal' direction='row' align='center' margin={{bottom: 'medium'}}>
            <RepositoryIcon size={IMG_SIZE} repository={repository} />
            {recipes && recipes.edges.length > 0 && (
              <Box fill='horizontal' direction='row' justify='end'>
                <ViewToggle view={view} setView={setView} />
              </Box>
            )}
          </Box>
          {view === RepoView.PKG && (
            <Box animation='fadeIn' fill>
              <DetailView
                repository={repository}
                terraform={terraform}
                charts={charts}
                dockerRepositories={dockerRepositories}
                fetchMore={fetchMore} />
            </Box>
          )}
          {view === RepoView.RECIPE && (
            <Box pad='small' animation='fadeIn' fill>
              <Recipes recipes={recipes} fetchMore={fetchMore} repository={repository} />
            </Box>
          )}
          {view === RepoView.DEPLOY && (
            <Box pad='small' animation='fadeIn' fill>
              <Rollouts repository={repository} />
            </Box>
          )}
        </Box>
        <Box pad='small' gap='medium' width={`${100 - WIDTH}%`} fill='vertical' style={{overflow: 'auto'}}>
          <Installation
            repository={repository}
            integrations={integrations}
            fetchMore={fetchMore} />
          {integrations && integrations.edges.length > 0 && (
            <Integrations integrations={integrations} fetchMore={fetchMore} repository={repository} />
          )}
          <Artifacts artifacts={repository.artifacts} />
        </Box>
      </Box>
    </ScrollableContainer>
  )
}