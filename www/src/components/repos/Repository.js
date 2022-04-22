import { useContext, useState } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
// import { Scroller, Button, SecondaryButton, Modal, ModalHeader, Password as Lock } from 'forge-core'
import { Button, Password as Lock, Scroller } from 'forge-core'
import yaml from 'js-yaml'

// import CreateTerraform from './CreateTerraform'
import Highlight from 'react-highlight'
import moment from 'moment'

import AceEditor from 'react-ace'

import { extendConnection } from '../../utils/graphql'
import { PluralConfigurationContext } from '../login/CurrentUser'
import 'ace-builds/src-noconflict/mode-yaml'
import 'ace-builds/src-noconflict/theme-terminal'
import { SectionPortal } from '../Explore'
import { AuthMethod } from '../oidc/types'

import { Provider } from './misc'
import { RepoForm } from './CreateRepository'
import { Categories, DEFAULT_CHART_ICON, DEFAULT_DKR_ICON, DEFAULT_TF_ICON } from './constants'
import { REPO_Q, UPDATE_REPO } from './queries'

function Container({ children, onClick, noPad }) {
  return (
    <Box
      onClick={onClick}
      focusIndicator={false}
      hoverIndicator="background-contrast"
      pad={noPad ? null : 'small'}
      direction="row"
      border={{ side: 'bottom' }}
      gap="small"
    >
      {children}
    </Box>
  )
}

function Chart({ chart, hasNext }) {
  const { dark } = useContext(ThemeContext)
  const navigate = useNavigate()

  return (
    <Container
      onClick={() => navigate(`/charts/${chart.id}`)}
      hasNext={hasNext}
    >
      <Box
        width="50px"
        heigh="50px"
      >
        <img
          alt=""
          width="50px"
          height="50px"
          src={chart.icon || DEFAULT_CHART_ICON}
        />
      </Box>
      <Box
        gap="xxsmall"
        justify="center"
      >
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            weight={500}
          >
            {chart.name}
          </Text>
          {chart.dependencies && chart.dependencies.application && (
            <Box
              round="xsmall"
              pad={{ vertical: '3px', horizontal: '5px' }}
              background={dark ? 'card' : 'light-4'}
            >
              <Text size="12px">APP</Text>
            </Box>
          )}
        </Box>
        <Text size="small">
          {chart.latestVersion} {chart.description ? `- ${chart.description}` : null}
        </Text>
      </Box>
    </Container>
  )
}

function DockerRepository({ docker, repo, hasNext }) {
  const { registry } = useContext(PluralConfigurationContext)
  const navigate = useNavigate()

  return (
    <Container
      hasNext={hasNext}
      onClick={() => navigate(`/dkr/repo/${docker.id}`)}
    >
      <Box
        width="50px"
        heigh="50px"
      >
        <img
          alt=""
          width="50px"
          height="50px"
          src={DEFAULT_DKR_ICON}
        />
      </Box>
      <Box justify="center">
        <Text
          size="small"
          weight={500}
        >
          {docker.name}
        </Text>
        <Text size="small">
          docker pull {registry}/{repo.name}/{docker.name} -- created {moment(docker.insertedAt).fromNow()}
        </Text>
      </Box>
    </Container>
  )
}

function Tf({ terraform, hasNext }) {
  const navigate = useNavigate()

  return (
    <Container
      onClick={() => navigate(`/terraform/${terraform.id}`)}
      hasNext={hasNext}
    >
      <Box
        width="50px"
        heigh="50px"
      >
        <img
          alt=""
          width="50px"
          height="50px"
          src={DEFAULT_TF_ICON}
        />
      </Box>
      <Box
        gap="xxsmall"
        justify="center"
      >
        <Box
          direction="row"
          align="center"
          gap="xsmall"
        >
          <Text
            size="small"
            weight={500}
          >
            {terraform.name}
          </Text>
          {terraform.dependencies && terraform.dependencies.providers && terraform.dependencies.providers.map(provider => (
            <Provider
              provider={provider}
              width={15}
            />
          ))}
        </Box>
        <Text size="small">
          {terraform.latestVersion} {terraform.description && `- ${terraform.description}`}
        </Text>
      </Box>
    </Container>
  )
}

export function Charts({ edges, pageInfo, fetchMore }) {
  return (
    <Scroller
      id="charts"
      edges={edges}
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      mapper={({ node }, next) => (
        <Chart
          key={node.id}
          chart={node}
          hasNext={!!next.node}
        />
      )}
      emptyState={<EmptyTab text="No charts uploaded yet" />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { chartCursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { charts } }) => extendConnection(prev, charts, 'charts'),
      })}
    />
  )
}

export function Terraform({ edges, pageInfo, fetchMore }) {
  return (
    <Scroller
      id="terraform"
      edges={edges}
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      mapper={({ node }, next) => (
        <Tf
          key={node.id}
          terraform={node}
          hasNext={!!next.node}
        />
      )}
      emptyState={<EmptyTab text="no terraform modules uploaded yet" />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { tfCursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { terraform } }) => extendConnection(prev, terraform, 'terraform'),
      })}
    />
  )
}

function EmptyTab({ text }) {
  return (
    <Box pad="small">
      <Text size="small">{text}</Text>
    </Box>
  )
}

export function DockerRepos({ edges, repo, pageInfo, fetchMore }) {
  return (
    <Scroller
      id="docker"
      edges={edges}
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      mapper={({ node }, next) => (
        <DockerRepository
          key={node.id}
          docker={node}
          repo={repo}
          hasNext={!!next.node}
        />
      )}
      emptyState={<EmptyTab text="no repos created yet" />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { dkrCursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { dockerRepositories: dkr } }) => extendConnection(prev, dkr, 'dockerRepositories'),
      })}
    />
  )
}

// function TerraformCreateModal({repositoryId}) {
//   return (
//     <Modal target={<SecondaryButton round='xsmall' label='Create' />}>
//     {setOpen => (
//       <Box width='40vw'>
//         <ModalHeader text='Create Terraform Module' setOpen={setOpen} />
//         <Box pad='small'>
//         <CreateTerraform repositoryId={repositoryId} onCreate={() => setOpen(false)} />
//         </Box>
//       </Box>
//     )}
//     </Modal>
//   )
// }

export function RepoCredentials({ publicKey }) {
  return (
    <Box
      fill
      pad="small"
    >
      {publicKey && (
        <Highlight language="plaintext">
          {publicKey}
        </Highlight>
      )}
      {!publicKey && (
        <Text size="small">You are not allowed to view repository keys</Text>
      )}
    </Box>
  )
}

function buildAttributes(attrs, image, darkImage) {
  const attributes = { ...attrs }
  if (image) {
    attributes.icon = image.file
  }

  if (darkImage) {
    attributes.darkIcon = darkImage.file
  }

  return attributes
}

export function RepoUpdate({ repository }) {
  const { authMethod, uriFormat } = repository.oauthSettings || { authMethod: AuthMethod.POST }
  const [state, setState] = useState({
    name: repository.name,
    description: repository.description,
    tags: repository.tags.map(({ tag }) => tag),
    private: repository.private,
    category: repository.category || Categories.DEVOPS,
    oauthSettings: { authMethod, uriFormat },
  })
  const [image, setImage] = useState(null)
  const [darkImage, setDarkImage] = useState(null)
  const { oauthSettings, ...base } = state
  const attributes = { ...base, tags: state.tags.map(t => ({ tag: t })), oauthSettings: oauthSettings.uriFormat ? oauthSettings : null }
  const [mutation, { loading, error }] = useMutation(UPDATE_REPO, {
    variables: { id: repository.id, attributes: buildAttributes(attributes, image, darkImage) },
    update: (cache, { data: { updateRepository } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: { repositoryId: repository.id } })
      cache.writeQuery({ query: REPO_Q,
        variables: { repositoryId: repository.id },
        data: {
          ...prev, repository: { ...prev.repository, ...updateRepository },
        } })
    },
  })

  return (
    <RepoForm
      label={`Update ${repository.name}`}
      error={error}
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

export function UpdateSecrets({ repository }) {
  const [secrets, setSecrets] = useState(yaml.safeDump(repository.secrets || {}, null, 2))
  const [mutation, { loading }] = useMutation(UPDATE_REPO, {
    variables: { id: repository.id, attributes: { secrets } },
    update: (cache, { data: { updateRepository } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: { repositoryId: repository.id } })
      cache.writeQuery({ query: REPO_Q,
        variables: { repositoryId: repository.id },
        data: {
          ...prev,
          repository: {
            ...prev.repository,
            ...updateRepository,
          },
        } })
    },
  })

  return (
    <Box
      pad="small"
      gap="small"
    >
      <AceEditor
        mode="yaml"
        theme="terminal"
        height="300px"
        width="100%"
        name="secrets"
        value={secrets}
        onChange={setSecrets}
        showGutter
        showPrintMargin
        highlightActiveLine
        editorProps={{ $blockScrolling: true }}
      />
      <SectionPortal>
        <Button
          loading={loading}
          label="Save"
          onClick={mutation}
        />
      </SectionPortal>
    </Box>
  )
}

export function RepositoryIcon({ size, repository, headingSize, dark }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      fill="horizontal"
    >
      <Box
        width={size}
        height={size}
        flex={false}
      >
        <img
          alt=""
          width={size}
          height={size}
          src={dark ? repository.darkIcon || repository.icon : repository.icon}
        />
      </Box>
      <Box
        pad="small"
        fill="horizontal"
        wrap
      >
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            weight="bold"
            size={headingSize}
          >{repository.name}
          </Text>
          {repository.private && <Lock size="small" />}
        </Box>
        <Text
          size="small"
          color={dark ? null : 'dark-3'}
        >{repository.description}
        </Text>
      </Box>
    </Box>
  )
}
