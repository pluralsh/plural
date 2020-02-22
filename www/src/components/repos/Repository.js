import React, {useState, useContext, useEffect} from 'react'
import {Box, Text, Anchor, Table, TableHeader, TableRow, TableCell, TableBody, CheckBox} from 'grommet'
import {Bundle, FormPrevious} from 'grommet-icons'
import {useQuery, useMutation} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import yaml from 'js-yaml'
import Button, {SecondaryButton} from '../utils/Button'
import Modal, {ModalHeader} from '../utils/Modal'
import Tabs, {TabHeader, TabHeaderItem, TabContent, BORDER_COLOR} from '../utils/Tabs'
import {REPO_Q, UPDATE_REPO, DOCKER_IMG_Q} from './queries'
import {DEFAULT_CHART_ICON, DEFAULT_TF_ICON, DEFAULT_DKR_ICON} from './constants'
import Installation from './Installation'
import CreateTerraform from './CreateTerraform'
import {RepoForm} from './CreateRepository'
import {BreadcrumbContext} from '../Chartmart'
import Highlight from 'react-highlight'
import Recipes from './Recipes'
import moment from 'moment'
import ScrollableContainer from '../utils/ScrollableContainer'
import { Provider } from './misc'
import Artifacts from './Artifacts'
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"

function Container({children, onClick, hasNext, noPad}) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{cursor: 'pointer'}}
      background={hover ? 'light-2' : null}
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
        <Text size='small' style={{fontWeight: 500}}>
          {chart.name}
        </Text>
        <Text size='small'>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </Text>
      </Box>
    </Container>
  )
}

function DockerRepository({docker, repo, hasNext, setRepo}) {
  return (
    <Container hasNext={hasNext} onClick={() => setRepo(docker)}>
      <Box width='70px' heigh='50px'>
        <img alt='' width='70px' height='50px' src={DEFAULT_DKR_ICON} />
      </Box>
      <Box justify='center'>
        <Text size='small' style={{fontWeight: 500}}>
          {docker.name}
        </Text>
        <Text size='small'>
          docker pull dkr.piazzaapp.com/{repo.name}/{docker.name} -- created {moment(docker.insertedAt).fromNow()}
        </Text>
      </Box>
    </Container>
  )
}

function DockerImage({image}) {
  return (
    <TableRow>
      <TableCell>
        <Box direction='row' gap='xsmall' width='100px' align='center'>
          <Bundle size='12px' /> {image.tag}
        </Box>
      </TableCell>
      <TableCell>{image.digest}</TableCell>
      <TableCell>{moment(image.insertedAt).fromNow()}</TableCell>
    </TableRow>
  )
}

function Tf({terraform, hasNext}) {
  let history = useHistory()
  console.log(terraform)
  return (
    <Container onClick={() => history.push(`/terraform/${terraform.id}`)} hasNext={hasNext}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_TF_ICON} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Box direction='row' align='center' gap='xsmall'>
          <Text size='small' style={{fontWeight: 500}}>
            {terraform.name}
          </Text>
          {terraform.dependencies && terraform.dependencies.providers && terraform.dependencies.providers.map((provider) => <Provider provider={provider} width={15} />)}
        </Box>
        <Text size='small'>
          {terraform.description}
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
      emptyState={<Text size='medium'>No charts uploaded yet</Text>}
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {chartCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const {edges, pageInfo} = fetchMoreResult.charts
            return edges.length ? {
              ...prev,
              charts: {
                ...prev.charts,
                pageInfo,
                edges: [...prev.charts.edges, ...edges]
              }
            } : prev
          }
        })
      }}
    />
  )
}

function Terraform({edges, pageInfo, fetchMore}) {
  return (
    <Scroller id='terraform'
      edges={edges}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => <Tf key={node.id} terraform={node} hasNext={!!next.node} />}
      emptyState={<Text size='medium'>No terraform modules uploaded yet</Text>}
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {tfCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const {edges, pageInfo} = fetchMoreResult.terraform
            return edges.length ? {
              ...prev,
              terraform: {
                ...prev.terraform,
                pageInfo,
                edges: [...prev.terraform.edges, ...edges]
              }
            } : prev
          }
        })
      }}
    />
  )
}

function DockerImages({dockerRepository, clear}) {
  const {data, loading} = useQuery(DOCKER_IMG_Q, {
    variables: {dockerRepositoryId: dockerRepository.id}
  })

  if (!data || loading) return null
  const {edges} = data.dockerImages

  return (
    <Box pad={{vertical: 'small'}} gap='small'>
      <Box direction='row' gap='xxsmall' align='center'>
        <FormPrevious size='14px' />
        <Anchor onClick={clear}>
          return to docker repositories
        </Anchor>
      </Box>
      <Box border>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell scope='col' border='bottom'>tag</TableCell>
              <TableCell scope='col' border='bottom'>sha</TableCell>
              <TableCell scope='col' border='bottom'>created</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {edges.map(({node}) => <DockerImage key={node.id} image={node} clear={clear} />)}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

function DockerRepos({edges, repo, pageInfo, fetchMore}) {
  const [dockerRepository, setDockerRepository] = useState(null)
  if (dockerRepository) {
    return <DockerImages dockerRepository={dockerRepository} clear={() => setDockerRepository(null)} />
  }

  return (
    <Scroller id='docker'
      edges={edges}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => (
        <DockerRepository
          key={node.id}
          docker={node}
          repo={repo}
          hasNext={!!next.node}
          setRepo={setDockerRepository} />
      )}
      emptyState={<Box pad='small'><Text size='small'>No repos created yet</Text></Box>}
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {dkrCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const {edges, pageInfo} = fetchMoreResult.dockerRepositories
            return edges.length ? {
              ...prev,
              dockerRepositories: {
                ...prev.dockerRepositories,
                pageInfo,
                edges: [...prev.dockerRepositories.edges, ...edges]
              }
            } : prev
          }
        })
      }}
    />
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

function RepoUpdate({repository}) {
  const [state, setState] = useState({
    name: repository.name,
    description: repository.description,
    tags: repository.tags.map(({tag}) => tag)
  })
  const [image, setImage] = useState(null)
  const attributes = {...state, tags: state.tags.map((t) => ({tag: t}))}
  const [mutation, {loading}] = useMutation(UPDATE_REPO, {
    variables: {id: repository.id, attributes: image ? {...attributes, icon: image.file} : attributes},
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
    <RepoForm
      label={`Update ${repository.name}`}
      state={state}
      setState={setState}
      image={image}
      setImage={setImage}
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
      <AceEditor
        mode='yaml'
        theme='terminal'
        height='300px'
        width='100%'
        name='secrets'
        value={secrets}
        onChange={setSecrets}
        showGutter
        showPrintMargin
        highlightActiveLine
        editorProps={{ $blockScrolling: true }} />
      <Box direction='row' justify='end'>
        <Button loading={loading} label='Save' onClick={mutation} />
      </Box>
    </Box>
  )
}

export function RepositoryIcon({size, repository, headingSize}) {
  return (
    <>
    <Box width={size} height={size} flex={false}>
      <img alt='' width={size} height={size} src={repository.icon} />
    </Box>
    <Box pad='small' flex={false}>
      <Text weight='bold' size={headingSize}>{repository.name}</Text>
      <Text size='small' color='dark-3'>{repository.description}</Text>
    </Box>
    </>
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
          <Text style={{fontWeight: 500}} size='small'>Charts</Text>
        </TabHeaderItem>
        <TabHeaderItem name='terraform'>
          <Text style={{fontWeight: 500}} size='small'>Terraform</Text>
        </TabHeaderItem>
        <TabHeaderItem name='docker'>
          <Text style={{fontWeight: 500}} size='small'>Docker</Text>
        </TabHeaderItem>
        {repository.publicKey && (
          <TabHeaderItem name='credentials'>
            <Text style={{fontWeight: 500}} size='small'>Credentials</Text>
          </TabHeaderItem>
        )}
        {repository.editable && (
          <TabHeaderItem name='secrets'>
            <Text style={{fontWeight: 500}} size='small'>Secrets</Text>
          </TabHeaderItem>
        )}
        {repository.editable && (
          <TabHeaderItem name='edit'>
            <Text style={{fontWeight: 500}} size='small'>Edit</Text>
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
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  const [detail, setDetail] = useState(false)
  useEffect(() => {
    if (!data) return
    const {repository} = data

    setBreadcrumbs([
      {url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name},
      {url: `/repositories/${repository.id}`, text: repository.name}
    ])
  }, [setBreadcrumbs, data])

  if (loading) return null
  const {charts, repository, terraform, dockerRepositories, recipes, integrations} = data

  return (
    <ScrollableContainer>
      <Box pad='small' direction='row'>
        <Box pad='small' width={`${WIDTH}%`}>
          <Box fill='horizontal' direction='row' align='center' margin={{bottom: 'medium'}}>
            <RepositoryIcon size={IMG_SIZE} repository={repository} />
            <Box fill='horizontal' direction='row' justify='end'>
              <Box flex={false}>
                <CheckBox
                  toggle
                  checked={detail}
                  label={detail ? 'detail' : 'recipes'}
                  onChange={({target: {checked}}) => setDetail(checked)} />
              </Box>
            </Box>
          </Box>
          {(detail || recipes.edges.length <= 0) && (
            <Box animation='fadeIn'>
              <DetailView
                repository={repository}
                terraform={terraform}
                charts={charts}
                dockerRepositories={dockerRepositories}
                fetchMore={fetchMore} />
            </Box>
          )}
          {!detail && recipes.edges.length > 0 && (
            <Box pad='small' animation='fadeIn'>
              <Recipes {...recipes} fetchMore={fetchMore} repository={repository} />
            </Box>
          )}
        </Box>
        <Box pad='small' gap='medium' width={`${100 - WIDTH}%`}>
          <Installation
            repository={repository}
            integrations={integrations}
            fetchMore={fetchMore} />
          <Artifacts artifacts={repository.artifacts} />
        </Box>
      </Box>
    </ScrollableContainer>
  )
}