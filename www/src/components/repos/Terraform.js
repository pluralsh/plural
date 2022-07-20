import { useContext, useEffect, useState } from 'react'
import { Box, Markdown, Text } from 'grommet'
import { ScrollableContainer, TabContent, TabHeader, TabHeaderItem, Tabs } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import Highlight from 'react-highlight.js'

import { Button, Flex, Modal } from 'honorable'

import { Versions } from '../versions/Versions'

import { Breadcrumbs, BreadcrumbsContext } from '../Breadcrumbs'

import { deepUpdate, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { INSTALL_TF, TF_Q, UNINSTALL_TF } from './queries'
import { DEFAULT_TF_ICON } from './constants'

import { PackageGrade } from './misc'

function Code({ value, children, language }) {
  return (
    <Highlight language={language || 'sh'}>
      {value || children}
    </Highlight>
  )
}

const MARKDOWN_STYLING = {
  p: { props: { size: 'small', margin: { top: 'xsmall', bottom: 'xsmall' } } },
  h1: {
    props: {
      style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' },
      size: 'small',
      margin: { top: 'small', bottom: 'small' },
    },
  },
  h2: {
    props: {
      style: { borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%' },
      size: 'xsmall',
      margin: { top: 'small', bottom: 'small' },
    },
  },
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

  return (
    <>
      {error && (
        <Modal><GqlError
          error={error}
          header="Could not install module"
        />
        </Modal>
      )}
      {installed ? (
        <Button
          secondary
          onClick={mutation}
        >
          Uninstall
        </Button>
      )
        : (
          <Button
            round="xsmall"
            onClick={mutation}
          >
            Install
          </Button>
        )}
    </>
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
      <Box flex>
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

export default function Terraform() {
  const [, setTab] = useState(null)
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
      { url: '/marketplace', text: 'Marketplace' },
      { url: `/repository/${terraformModule.repository.id}/packages/terraform`, text: terraformModule.repository.name },
      { url: `/terraform/${terraformModule.id}`, text: terraformModule.name },
    ])
  }, [data, setBreadcrumbs])

  if (!data) return null
  const { terraformModule, versions } = data
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const tfInst = terraformModule.installation

  return (
    <Box direction="column">
      <Flex
        paddingVertical={18}
        marginLeft="xlarge"
        marginRight="xlarge"
        paddingLeft="xsmall"
        paddingRight="xsmall"
        borderBottom="1px solid border"
      >
        <Breadcrumbs />
      </Flex>
      <ScrollableContainer>
        <Box
          pad="medium"
          direction="row"
        >
          <Box
            width={`${width}%`}
            fill="vertical"
            pad="small"
          >
            <TerraformHeader
              terraform={terraformModule}
              version={currentVersion}
            />
            <Tabs
              defaultTab="readme"
              onTabChange={setTab}
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
                {/* <ScanResults scan={currentVersion.scan} /> */}
              </TabContent>
              <TabContent name="configuration">
                <TemplateView valuesTemplate={currentVersion.valuesTemplate} />
              </TabContent>
              <TabContent name="dependencies">
                {/* {full ? <FullDependencies resource={terraformModule} /> : ( */}
                {/*  <Dependencies */}
                {/*    name={terraformModule.name} */}
                {/*    dependencies={(version || terraformModule).dependencies} */}
                {/*    resource={terraformModule} */}
                {/*  /> */}
                {/* )} */}
              </TabContent>
              {tfInst && (
                <TabContent name="updates">
                  {/* <DeferredUpdates tfInst={tfInst.id} /> */}
                </TabContent>
              )}
            </Tabs>
          </Box>
          <Box
            pad="small"
            width={`${100 - width}%`}
            gap="small"
          >
            <Versions
              edges={edges}
              pageInfo={pageInfo}
              refetch={refetch}
              fetchMore={fetchMore}
              setVersion={setVersion}
            />
          </Box>
        </Box>
      </ScrollableContainer>
    </Box>
  )
}
