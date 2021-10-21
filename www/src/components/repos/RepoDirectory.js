import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { SectionContentContainer, SectionItemContainer } from '../Explore'
import { Add } from 'grommet-icons'
import { Update, Install, Configuration, Package, EditField as Edit, Bundle, Plan as PlanIcon } from 'forge-core'
import Collapsible from 'react-collapsible'
import { RepositoryIcon } from './Repository'
import { InstallationInner, Plans } from './Installation'
import { Box } from 'grommet'
import { UpdateInstallation } from './EditInstallation'
import CreatePlan from '../payments/CreatePlan'
import Recipes from './Recipes'
import { Charts, Terraform, DockerRepos, RepoUpdate, UpdateSecrets, RepoCredentials } from './Repository'
import { Rollouts } from '../upgrades/Rollouts'
import { useQuery } from 'react-apollo'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { REPO_Q } from './queries'
import { ArtifactTable } from './Artifacts'
import { OIDCProvider } from '../oidc/OIDCProvider'
import { LoopingLogo } from '../utils/AnimatedLogo'

const ICON_SIZE = '14px'
const IMG_SIZE = '75px'


function SectionContent({name, header, children, subgroup: subgroupName}) {
  const {group, subgroup} = useParams()
  if (subgroup !== subgroupName || group !== name) return null

  return (
    <SectionContentContainer header={header}>
      {children}
    </SectionContentContainer>
  )
}

function SectionItem({name, label, icon, subgroup: subgroupName, location, ...props}) {
  const {group, subgroup, id} = useParams()
  const baseLocation = `/repositories/${id}/${name}`

  return (
    <SectionItemContainer
      label={label}
      icon={icon && React.createElement(icon, {size: ICON_SIZE})}
      selected={subgroupName === subgroup && group === name}
      location={location ? location : (subgroupName ? `${baseLocation}/${subgroupName}` : baseLocation)}
      {...props} />
  )
}

function SubgroupContainer({name, children}) {
  const {group} = useParams()
  
  return (
    <Collapsible open={group === name} direction='vertical'>
      <Box pad={{left: 'small', top: 'xsmall'}} gap='xsmall'>
        {children}
      </Box>
    </Collapsible>
  )
}

export function RepoDirectory() {
  const {id, group, subgroup} = useParams()
  const [open, setOpen] = useState(null)
  const {data, fetchMore} = useQuery(REPO_Q, {
    variables: {repositoryId: id},
    fetchPolicy: "cache-and-network"
  })

  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  
  useEffect(() => {
    if (!data) return
    const {repository} = data
    let crumbs = [
      {url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name},
      {url: `/repositories/${repository.id}`, text: repository.name},
      {url: `/repositories/${repository.id}/${group}`, text: group.toLowerCase()}
    ]
    if (subgroup) crumbs.push({url: `/repositories/${repository.id}/${group}/${subgroup}`, text: subgroup})
    setBreadcrumbs(crumbs)
  }, [setBreadcrumbs, data, group, subgroup])

  if (!data) return <LoopingLogo />

  const {recipes, repository, charts, terraform, dockerRepositories} = data
  const hasPlans = repository.plans && repository.plans.length > 0

  return (
    <Box direction='row' fill>
      <Box flex={false} width='30%' background='backgroundColor' fill='vertical' 
           pad={{vertical: 'small', horizontal: 'small'}}>
        <Box flex={false} pad={{bottom: 'small', left: 'small'}}>
          <RepositoryIcon repository={data.repository} size={IMG_SIZE} dark />
        </Box>
        <Box fill style={{overflow: 'auto'}}>
        <Box flex={false} gap='xsmall'>
          <InstallationInner repository={repository} installation={repository.installation} />
          <SectionItem
            name='bundles' 
            label='Bundles' 
            icon={Bundle} />
          <Box flex={false}>
            <SectionItem
              name='packages'
              label='Packages'
              location={`/repositories/${id}/packages/helm`}
              icon={Package} />
            <SubgroupContainer name='packages'>
              <SectionItem
                name='packages'
                subgroup='helm'
                label='Helm' />
              <SectionItem
                name='packages'
                subgroup='terraform'
                label='Terraform' />
              <SectionItem
                name='packages'
                subgroup='docker'
                label='Docker' />
            </SubgroupContainer>
          </Box>
          {repository.installation && (
            <Box flex={false}>
              <SectionItem
                name='configure'
                label='Configure'
                icon={Configuration}
                location={`/repositories/${id}/configure/upgrades`} />
              <SubgroupContainer name='configure'>
                <SectionItem
                  name='configure'
                  subgroup='upgrades'
                  label='Upgrades' />
                <SectionItem
                  name='configure'
                  subgroup='oidc'
                  label='OpenID Connect' />
              </SubgroupContainer>
            </Box>
          )}
          <SectionItem
            name='deployments'
            label='Deployments'
            icon={Update} />
          {repository.artifacts && repository.artifacts.length > 0 && (<SectionItem
            name='artifacts'
            label='Artifacts'
            icon={Install} />)}
          {repository.editable && (
            <Box flex={false}>
              <SectionItem
                name='edit'
                label='Edit'
                location={`/repositories/${id}/edit/details`}
                icon={Edit} />
              <SubgroupContainer name='edit'>
                <SectionItem
                  name='edit'
                  subgroup='details'
                  label='Repository Info' />
                <SectionItem
                  name='edit'
                  subgroup='secrets'
                  label='Secrets' />
                <SectionItem
                  name='edit'
                  subgroup='credentials'
                  label='Credentials' />
              </SubgroupContainer>
            </Box>
          )}
          {hasPlans && (
            <SectionItem
              name='plans'
              label='Payment Plans'
              icon={PlanIcon} />
          )}
          {repository.editable && (
            <>
            <SectionItem
              name='create-plan'
              label='Create Plan'
              icon={({size}) => (
                <Box direction='row' gap='xsmall'>
                  <Add size={size} />
                  <PlanIcon size={size} />
                </Box>
              )}
              onClick={() => setOpen('create-plan')} />
              {open === 'create-plan' && <CreatePlan repository={repository} setOpen={setOpen} />}
            </>
          )}
        </Box>
        </Box>
      </Box>
      <Box fill>
        <SectionContent name='bundles' header='Bundles'>
          <Recipes recipes={recipes} fetchMore={fetchMore} repository={repository} />
        </SectionContent>
        <SectionContent name='packages' subgroup='helm' header='Helm Charts'>
          <Charts {...charts} fetchMore={fetchMore} />
        </SectionContent>
        <SectionContent name='packages' subgroup='terraform' header='Terraform Modules'>
          <Terraform {...terraform} fetchMore={fetchMore} />
        </SectionContent>
        <SectionContent name='packages' subgroup='docker' header='Docker Repositories'>
          <DockerRepos {...dockerRepositories} repo={repository} fetchMore={fetchMore} />
        </SectionContent>
        <SectionContent name='configure' subgroup='upgrades' header='Configure Upgrades'>
          <UpdateInstallation installation={repository.installation} />
        </SectionContent>
        <SectionContent name='configure' subgroup='oidc' header='Configure OIDC Provider'>
          <OIDCProvider installation={repository.installation} />
        </SectionContent>
        <SectionContent name='deployments' header='Deployments'>
          <Rollouts repository={repository} />
        </SectionContent>
        <SectionContent name='edit' subgroup='details' header='Edit Repository Information'>
          <RepoUpdate repository={repository} />
        </SectionContent>
        <SectionContent name='edit' subgroup='secrets' header='Edit Repository Secrets'>
          <UpdateSecrets repository={repository} />
        </SectionContent>
        <SectionContent name='edit' subgroup='credentials' header='Repository Credentials'>
          <RepoCredentials publicKey={repository.publicKey} />
        </SectionContent>
        <SectionContent name='plans' header='Payment Plans'>
          <Plans repository={repository} nocreate />
        </SectionContent>
        <SectionContent name='artifacts' header='Artifacts'>
          <ArtifactTable artifacts={repository.artifacts} />
        </SectionContent>
      </Box>
    </Box>
  )
}