import React, {useState, useContext, useEffect} from 'react'
import {Box, Text} from 'grommet'
import {useQuery, useMutation} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {SecondaryButton} from '../utils/Button'
import Modal, {ModalHeader} from '../utils/Modal'
import Tabs, {TabHeader, TabHeaderItem, TabContent} from '../utils/Tabs'
import {REPO_Q, UPDATE_REPO} from './queries'
import {DEFAULT_CHART_ICON, DEFAULT_TF_ICON} from './constants'
import Installation from './Installation'
import CreateTerraform from './CreateTerraform'
import {RepoForm} from './CreateRepository'
import {BreadcrumbContext} from '../Chartmart'
import Highlight from 'react-highlight'


function Container({children, onClick, hasNext}) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{cursor: 'pointer'}}
      background={hover ? 'light-2' : null}
      pad='small'
      direction='row'
      border={hasNext ? 'bottom' : null}
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
        <Text size='small' >
          {chart.name}
        </Text>
        <Text size='small'>
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
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
        <Text size='small' >
          {terraform.name}
        </Text>
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
            const {edges, pageInfo} = fetchMoreResult.charts
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
  const [state, setState] = useState({name: repository.name, description: repository.description})
  const [image, setImage] = useState(null)
  const [mutation, {loading}] = useMutation(UPDATE_REPO, {
    variables: {id: repository.id, attributes: {...state, icon: image && image.file}},
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

const IMG_SIZE = '75px'

function Repository() {
  const {repositoryId} = useParams()
  const {loading, data, fetchMore} = useQuery(REPO_Q, {variables: {repositoryId}})
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  const [tab, setTab] = useState(null)
  useEffect(() => {
    if (!data) return
    const {repository} = data

    setBreadcrumbs([
      {url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name},
      {url: `/repositories/${repository.id}`, text: repository.name}
    ])
  }, [setBreadcrumbs, data])

  if (loading) return null
  const {charts, repository, terraform} = data
  return (
    <Box pad='small' direction='row' height='100%'>
      <Box pad='small' width='60%' height='100%'>
        <Box direction='row' align='center' margin={{bottom: 'medium'}}>
          <Box width={IMG_SIZE} height={IMG_SIZE}>
            <img alt='' width={IMG_SIZE} height={IMG_SIZE} src={repository.icon} />
          </Box>
          <Box gap='xsmall' pad='small'>
            <Text weight='bold'>{repository.name}</Text>
            <Text size='small'>{repository.description}</Text>
          </Box>
        </Box>
        <Tabs defaultTab='charts' onTabChange={setTab} headerEnd={tab === 'terraform' ? <TerraformCreateModal /> : null}>
          <TabHeader>
            <TabHeaderItem name='charts'>
              <Text style={{fontWeight: 500}} size='small'>Charts</Text>
            </TabHeaderItem>
            <TabHeaderItem name='terraform'>
              <Text style={{fontWeight: 500}} size='small'>Terraform</Text>
            </TabHeaderItem>
            {repository.publicKey && (
              <TabHeaderItem name='credentials'>
                <Text style={{fontWeight: 500}} size='small'>Credentials</Text>
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
          <TabContent name='credentials'>
            <RepoCredentials {...repository} />
          </TabContent>
          <TabContent name='edit'>
            <RepoUpdate repository={repository} />
          </TabContent>
        </Tabs>
      </Box>
      <Box pad='small' width='40%'>
        <Installation repository={repository} />
      </Box>
    </Box>
  )
}

export default Repository