import { useContext, useEffect, useState } from 'react'
import { Box } from 'grommet'
import { ScrollableContainer } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { Button, Flex, H2, Img, Modal } from 'honorable'

import { Tab } from 'pluralsh-design-system'

import ChartContext from '../../contexts/ChartContext'

import { Versions } from '../versions/Versions'

import { Breadcrumbs, BreadcrumbsContext } from '../Breadcrumbs'

import { deepUpdate, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { INSTALL_TF, TF_Q, UNINSTALL_TF } from './queries'
import { DEFAULT_TF_ICON } from './constants'

import { PackageGrade } from './common/misc'

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

function TerraformHeader({ terraform: { id, name, installation, repository }, version }) {
  return (
    <Box
      fill
      direction="row"
      align="center"
      gap="medium"
      margin={{ bottom: 'small' }}
      style={{ minHeight: '50px' }}
    >
      <Flex
        width="64px"
        height="64px"
        padding="8px"
        align="center"
        justify="center"
        backgroundColor="fill-one"
        border="1px solid border"
        borderRadius={4}
      >
        <Img
          width="48px"
          height="48px"
          src={DEFAULT_TF_ICON}
        />
      </Flex>
      <H2
        fontSize="20px"
        fontWeight="500px"
      >
        {name}
      </H2>
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

export default function Terraform() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [version, setVersion] = useState(null)
  const { tfId } = useParams()
  const { data, refetch, fetchMore } = useQuery(TF_Q, {
    variables: { tfId },
    fetchPolicy: 'cache-and-network',
  })
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
    <ChartContext.Provider value={{ terraformChart: terraformModule, currentTerraformChart: currentVersion }}>
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
            <Flex
              direction="column"
              flexBasis="300px"
              minWidth="300px"
            >
              <TerraformHeader
                terraform={terraformModule}
                version={currentVersion}
              />
              <Versions
                edges={edges}
                pageInfo={pageInfo}
                refetch={refetch}
                fetchMore={fetchMore}
                setVersion={setVersion}
              />
              <Tab
                vertical
                onClick={() => navigate(`/terraform/${terraformModule.id}`)}
                active={pathname.endsWith(`/terraform/${terraformModule.id}`)}
                textDecoration="none"
              >
                Readme
              </Tab>
              <Tab
                vertical
                onClick={() => navigate(`/terraform/${terraformModule.id}/configuration`)}
                active={pathname.startsWith(`/terraform/${terraformModule.id}/configuration`)}
                textDecoration="none"
              >
                Configuration
              </Tab>
              <Tab
                vertical
                onClick={() => navigate(`/terraform/${terraformModule.id}/dependencies`)}
                active={pathname.startsWith(`/terraform/${terraformModule.id}/dependencies`)}
                textDecoration="none"
              >
                Dependencies
              </Tab>
              <Tab
                vertical
                onClick={() => navigate(`/terraform/${terraformModule.id}/security`)}
                active={pathname.startsWith(`/terraform/${terraformModule.id}/security`)}
                textDecoration="none"
              >
                <Flex
                  flexGrow={1}
                  justifyContent="space-between"
                >
                  Security
                  {currentVersion?.scan && <PackageGrade scan={currentVersion.scan} />}
                </Flex>
              </Tab>
              {(tfInst && (
                <Tab
                  vertical
                  onClick={() => navigate(`/charts/${terraformModule.id}/updatequeue`)}
                  active={pathname.startsWith(`/charts/${terraformModule.id}/updatequeue`)}
                  textDecoration="none"
                >
                  Update queue
                </Tab>
              ))}
            </Flex>
            <Flex flexGrow={1}><Outlet /></Flex>
          </Box>
        </ScrollableContainer>
      </Box>
    </ChartContext.Provider>
  )
}
