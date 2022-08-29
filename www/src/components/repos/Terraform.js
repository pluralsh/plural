import { useRef, useState } from 'react'
import { Box } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import {
  Outlet, useLocation, useParams,
} from 'react-router-dom'

import { Button, Flex, Modal } from 'honorable'

import { Tab, TabList, TabPanel } from 'pluralsh-design-system'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'

import { GoBack } from 'components/utils/GoBack'

import { LinkTabWrap } from 'components/utils/Tabs'

import { deepUpdate, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { INSTALL_TF, TF_Q, UNINSTALL_TF } from './queries'
import { DEFAULT_TF_ICON } from './constants'

import { PackageGrade, PackageHeader, PackageVersionPicker } from './common/misc'

function TerraformInstaller({
  installation, terraformId, terraformInstallation, version,
}) {
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
      <Button
        secondary
        onClick={mutation}
      >
        {installed ? 'Uninstall' : 'Install'}
      </Button>
    </>
  )
}

export function TerraformActions({ terraformModule, currentVersion, ...props }) {
  return (
    <Box {...props}>
      {terraformModule.installation && (
        <TerraformInstaller
          installation={terraformModule.repository.installation}
          terraformInstallation={terraformModule.installation}
          version={currentVersion}
          terraformId={terraformModule.id}
        />
      )}
    </Box>
  )
}

export default function Terraform() {
  const { pathname } = useLocation()
  const [version, setVersion] = useState(null)
  const { tfId } = useParams()
  const { data, fetchMore } = useQuery(TF_Q, { variables: { tfId }, fetchPolicy: 'cache-and-network' })
  const tabStateRef = useRef()

  if (!data) return null

  const { terraformModule, versions } = data
  const { edges, pageInfo } = versions
  const currentVersion = version || edges[0].node
  const tfInst = terraformModule.installation

  const DIRECTORY = [
    { label: 'Readme', path: '' },
    { label: 'Configuration', path: '/configuration' },
    { label: 'Dependencies', path: '/dependencies' },
    {
      label: (
        <Flex
          flexGrow={1}
          justifyContent="space-between"
        >
          Security
          {currentVersion?.scan && (
            <PackageGrade grade={currentVersion.scan.grade} />
          )}
        </Flex>
      ),
      textValue: 'Security',
      path: '/security',
    },
    { label: 'Update queue', path: '/updatequeue' },
  ]
  const pathPrefix = `/terraform/${terraformModule.id}`

  const filteredDirectory = DIRECTORY.filter(({ path }) => {
    switch (path) {
    case '/updatequeue':
      return !!tfInst
    default:
      return true
    }
  })
  const currentTab = [...filteredDirectory]
    .sort((a, b) => b.path.length - a.path.length)
    .find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Box
      direction="column"
      fill
    >
      <GoBack
        text="Back to packages"
        link={`/repository/${terraformModule.repository.id}/packages/terraform`}
      />
      <Box
        pad="16px"
        direction="row"
      >
        <ResponsiveLayoutSidenavContainer>
          <Box pad={{ left: '16px' }}>
            <PackageHeader
              name={terraformModule.name}
              icon={DEFAULT_TF_ICON}
            />
            <PackageVersionPicker
              edges={edges}
              installed={tfInst}
              version={version || currentVersion}
              setVersion={setVersion}
              pageInfo={pageInfo}
              fetchMore={fetchMore}
            />
          </Box>
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'vertical',
              selectedKey: currentTab?.path,
            }}
          >
            {filteredDirectory.map(({ label, textValue, path }) => (
              <LinkTabWrap
                key={path}
                textValue={typeof label === 'string' ? label : textValue || ''}
                to={`${pathPrefix}${path}`}
              >
                <Tab>{label}</Tab>
              </LinkTabWrap>
            ))}
          </TabList>
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <TabPanel
          as={<ResponsiveLayoutContentContainer />}
          stateRef={tabStateRef}
        >
          <Outlet
            context={{
              terraformChart: terraformModule,
              currentTerraformChart: currentVersion,
            }}
          />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer width="200px">
          <TerraformActions
            terraformModule={terraformModule}
            currentVersion={currentVersion}
            height="54px"
          />
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Box>
    </Box>
  )
}
