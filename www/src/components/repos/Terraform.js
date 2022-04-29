import { useContext, useEffect, useState } from 'react'
import { Box, Markdown, Text } from 'grommet'
import { Button, InputCollection, ScrollableContainer, SecondaryButton, TabContent, TabHeader, TabHeaderItem, Tabs } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'

import Highlight from 'react-highlight.js'

import { Versions } from '../versions/Versions'

import ResponsiveInput from '../ResponsiveInput'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { deepUpdate, updateCache } from '../../utils/graphql'

import { DELETE_TF, INSTALL_TF, TF_Q, UNINSTALL_TF, UPDATE_TF } from './queries'
import { DEFAULT_TF_ICON } from './constants'
import Installation from './Installation'
import Dependencies, { FullDependencies, ShowFull } from './Dependencies'

import { DeferredUpdates } from './DeferredUpdates'
import { PackageGrade, ScanResults } from './PackageScan'

function Code({ value, children, language }) {
  return (
    <Highlight language={language || 'sh'}>
      {value || children}
    </Highlight>
  )
}

const MARKDOWN_STYLING = {
  p: { props: { size: 'small', margin: { top: 'xsmall', bottom: 'xsmall' } } },
  h1: { props: { style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' }, size: 'small', margin: { top: 'small', bottom: 'small' } } },
  h2: { props: { style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' }, size: 'xsmall', margin: { top: 'small', bottom: 'small' } } },
  pre: {
    component: Code,
    props: {},
  },
}

function TemplateView({ valuesTemplate }) {
  return (
    <Box
      style={{ overflow: 'auto', maxHeight: '100%' }}
      pad="small"
    >
      <Highlight language="terraform">
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
}

function TerraformInstaller({ installation, terraformId, terraformInstallation, version }) {
  const installed = terraformInstallation && terraformInstallation.version.id === version.id
  const [mutation, { error }] = useMutation(installed ? UNINSTALL_TF : INSTALL_TF, {
    variables: {
      id: installed ? terraformInstallation.id : installation.id,
      attributes: { terraformId, versionId: version.id },
    },
    update: (cache, { data }) => {
      const ti = data.installTerraform ? data.installTerraform : null
      updateCache(cache, {
        query: TF_Q,
        variables: { tfId: terraformId },
        update: prev => deepUpdate(prev, 'terraformModule.installation', () => ti),
      })
    },
  })

  return installed ? (
    <SecondaryButton
      round="xsmall"
      label="Uninstall"
      error={error}
      onClick={mutation}
    />
  ) : (
    <Button
      round="xsmall"
      label="Install"
      error={error}
      onClick={mutation}
    />
  )
}

function TerraformHeader({ terraform: { id, name, description, installation, repository }, version }) {
  return (
    <Box
      fill
      direction="row"
      align="center"
      gap="medium"
      margin={{ bottom: 'small' }}
      style={{ minHeight: '50px' }}
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
      <Box flex={1}>
        <Box
          direction="row"
          gap="small"
          align="center"
        >
          <Text size="medium">{name}</Text>
          {installation && (
            <Text
              size="small"
              color="dark-3"
            >
              (installed: {installation.version.version})
            </Text>
          )}
        </Box>
        <Text size="small"><i>{description}</i></Text>
      </Box>
      {version.scan && (
        <PackageGrade scan={version.scan} />
      )}
      {repository.installation && (
        <Box
          width="100px"
          direction="row"
          justify="end"
        >
          <TerraformInstaller
            installation={repository.installation}
            terraformInstallation={installation}
            version={version}
            terraformId={id}
          />
        </Box>
      )}
    </Box>
  )
}

function Readme({ readme }) {
  return (
    <Box
      gap="small"
      style={{ maxHeight: '100%', overflow: 'auto' }}
      pad="small"
    >
      <Box>
        <Markdown components={MARKDOWN_STYLING}>
          {readme || 'no readme'}
        </Markdown>
      </Box>
    </Box>
  )
}

function updateInstallation(tfId) {
  return (cache, repoId, installation) => {
    const prev = cache.readQuery({ query: TF_Q, variables: { tfId } })
    cache.writeQuery({
      query: TF_Q,
      variables: { tfId },
      data: {
        ...prev,
        terraformModule: {
          ...prev.terraformModule,
          repository: { ...prev.terraformModule.repository, installation } },
      },
    })
  }
}

function DeleteTerraform({ id }) {
  const navigate = useNavigate()
  const [mutation, { loading }] = useMutation(DELETE_TF, {
    variables: { id },
    onCompleted: () => navigate(-1),
  })

  return (
    <Button
      background="red-light"
      loading={loading}
      round="xsmall"
      label="Delete"
      onClick={mutation}
    />
  )
}

function UpdateTerraform({ id, name, description }) {
  const [attributes, setAttributes] = useState({ name, description })
  const [mutation, { loading }] = useMutation(UPDATE_TF, {
    variables: { id, attributes },
  })

  return (
    <Box
      pad="medium"
      gap="small"
    >
      <InputCollection>
        <ResponsiveInput
          label="name"
          placeholder="give it a  name"
          value={attributes.name}
          onChange={e => setAttributes({ ...attributes, name: e.target.value })}
        />
        <ResponsiveInput
          label="description"
          placeholder="a helpful description"
          value={attributes.description}
          onChange={e => setAttributes({ ...attributes, description: e.target.value })}
        />
      </InputCollection>
      <Box
        direction="row"
        justify="end"
        gap="small"
      >
        <DeleteTerraform id={id} />
        <Button
          loading={loading}
          round="xsmall"
          label="Update"
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

export default function Terraform() {
  const [tab, setTab] = useState(null)
  const [full, setFull] = useState(false)
  const [version, setVersion] = useState(null)
  const { tfId } = useParams()
  const { data, refetch, fetchMore } = useQuery(TF_Q, {
    variables: { tfId },
    fetchPolicy: 'cache-and-network',
  })
  const width = 65
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    if (!data) return
    const { terraformModule } = data
    setBreadcrumbs([
      { url: `/publishers/${terraformModule.repository.publisher.id}`, text: terraformModule.repository.publisher.name },
      { url: `/repositories/${terraformModule.repository.id}`, text: terraformModule.repository.name },
      { url: `/terraform/${terraformModule.id}`, text: terraformModule.name },
    ])
  }, [data, setBreadcrumbs])

  if (!data) return null
  const { terraformModule, versions } = data
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const tfInst = terraformModule.installation

  return (
    <ScrollableContainer>
      <Box
        pad="small"
        direction="row"
      >
        <Box
          width={`${width}%`}
          pad="small"
        >
          <TerraformHeader
            terraform={terraformModule}
            version={currentVersion}
          />
          <Tabs
            defaultTab="readme"
            onTabChange={setTab}
            headerEnd={tab === 'dependencies' ? (
              <ShowFull
                label={full ? 'Immediate' : 'Full'}
                onClick={() => setFull(!full)}
              />
            ) : null}
          >
            <TabHeader>
              <TabHeaderItem name="readme">
                <Text
                  size="small"
                  weight={500}
                >Readme
                </Text>
              </TabHeaderItem>
              <TabHeaderItem name="configuration">
                <Text
                  size="small"
                  weight={500}
                >
                  Configuration
                </Text>
              </TabHeaderItem>
              <TabHeaderItem name="dependencies">
                <Text
                  size="small"
                  weight={500}
                >
                  Dependencies
                </Text>
              </TabHeaderItem>
              {currentVersion.scan && (
                <TabHeaderItem name="scan">
                  <Text
                    size="small"
                    weight={500}
                  >
                    Security
                  </Text>
                </TabHeaderItem>
              )}
              {terraformModule.editable && (
                <TabHeaderItem name="edit">
                  <Text
                    size="small"
                    weight={500}
                  >
                    Edit
                  </Text>
                </TabHeaderItem>
              )}
              {tfInst && (
                <TabHeaderItem name="updates">
                  <Text
                    size="small"
                    weight={500}
                  >
                    Update Queue
                  </Text>
                </TabHeaderItem>
              )}
            </TabHeader>
            <TabContent name="readme">
              <Readme readme={currentVersion.readme} />
            </TabContent>
            <TabContent name="scan">
              <ScanResults scan={currentVersion.scan} />
            </TabContent>
            <TabContent name="configuration">
              <TemplateView valuesTemplate={currentVersion.valuesTemplate} />
            </TabContent>
            <TabContent name="dependencies">
              {full ? <FullDependencies resource={terraformModule} /> : (
                <Dependencies
                  name={terraformModule.name}
                  dependencies={(version || terraformModule).dependencies}
                  resource={terraformModule}
                />
              )}
            </TabContent>
            <TabContent name="edit">
              <UpdateTerraform {...terraformModule} />
            </TabContent>
            {tfInst && (
              <TabContent name="updates">
                <DeferredUpdates tfInst={tfInst.id} />
              </TabContent>
            )}
          </Tabs>
        </Box>
        <Box
          pad="small"
          width={`${100 - width}%`}
          gap="small"
        >
          {tab === 'configuration' ? (
            <Installation
              noHelm
              open
              repository={terraformModule.repository}
              onUpdate={updateInstallation(tfId)}
            />
          ) : (
            <Versions
              edges={edges}
              pageInfo={pageInfo}
              refetch={refetch}
              fetchMore={fetchMore}
              setVersion={setVersion}
            />
          )}
        </Box>
      </Box>
    </ScrollableContainer>
  )
}
