import { useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import moment from 'moment'
import { Box } from 'grommet'

import {
  Codeline, ListBoxItem, ListBoxItemChipList, Select, Switch, Tab,
} from 'pluralsh-design-system'

import { GoBack } from 'components/utils/GoBack'

import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'

import { PluralConfigurationContext } from '../login/CurrentUser'

import { LoopingLogo } from '../utils/AnimatedLogo'

import {
  PackageGrade, PackageHeader, PackageProperty, dockerPull,
} from './common/misc'

import { DetailContainer } from './Installation'
import { DEFAULT_DKR_ICON } from './constants'
import { DOCKER_IMG_Q, DOCKER_Q, UPDATE_DOCKER } from './queries'

function PublicSwitch({ dockerRepo }) {
  const [mutation] = useMutation(UPDATE_DOCKER, { variables: { id: dockerRepo.id } })

  return (
    <Switch
      checked={dockerRepo.public}
      disabled={!dockerRepo.repository.editable}
      onChange={({ target: { checked } }) => mutation({
        variables: { attributes: { public: checked } },
      })}
    >
      {dockerRepo.public ? 'Public' : 'Private'}
    </Switch>
  )
}

export function DockerRepository() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data } = useQuery(DOCKER_IMG_Q, { variables: { dockerRepositoryId: id } })

  useEffect(() => {
    if (!data) return
    const { dockerImages: { edges } } = data

    if (edges.length === 0) return

    navigate(`/dkr/img/${edges[0].node.id}`, { replace: true })
  }, [data, navigate])

  return <LoopingLogo />
}

const DEFAULT_FILTER = { tag: null, precision: '1h', offset: '1d' }

function ImageVersionPicker({ image }) {
  const navigate = useNavigate()
  const { dockerRepository } = image
  const { data, loading } = useQuery(DOCKER_IMG_Q, {
    variables: { dockerRepositoryId: dockerRepository.id },
  })

  if (!data || loading) return null

  const { edges } = data.dockerImages
  const images = edges.map(({ node }) => node)

  return (
    <Box
      width="240px"
      gap="small"
      margin={{ bottom: 'medium' }}
    >
      <Select
        label="image"
        width="240px"
        selectedKey={image.id}
        onSelectionChange={selected => navigate(`/dkr/img/${selected}`)}
        rightContent={
          image.scannedAt && (
            <ListBoxItemChipList chips={[
              <PackageGrade
                grade={image.grade}
                size="small"
              />,
            ]}
            />
          )
        }
      >
        {images.map(v => (
          <ListBoxItem
            key={v.id}
            label={v.tag}
            rightContent={(
              <ListBoxItemChipList
                chips={[...(v.scannedAt ? [
                  <PackageGrade
                    grade={v.grade}
                    size="small"
                  />,
                ] : [])]}
              />
            )}
          />
        ))}
      </Select>
    </Box>
  )
}

export function Docker() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const { registry } = useContext(PluralConfigurationContext)

  const { data } = useQuery(DOCKER_Q, {
    variables: { id, ...filter },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => setFilter(DEFAULT_FILTER), [id])

  if (!data) return <LoopingLogo />

  const { dockerImage: image } = data
  const imageName = dockerPull(registry, { ...image, dockerRepository: image.dockerRepository })

  console.log(image)

  return (
    <Box
      direction="column"
      fill
    >
      <GoBack
        text="Back to packages"
        link={`/repository/${image.dockerRepository.repository.id}/packages/docker`}
      />
      <Box
        pad="16px"
        direction="row"
      >
        <ResponsiveLayoutSidenavContainer>
          <Box pad={{ left: '16px' }}>
            <PackageHeader
              name={image.dockerRepository.name}
              icon={DEFAULT_DKR_ICON}
            />
            <ImageVersionPicker image={image} />
          </Box>
          <Tab
            vertical
            onClick={() => navigate(`/dkr/img/${image.id}`)}
            active={pathname.endsWith(`/dkr/img/${image.id}`)}
            textDecoration="none"
          >
            Pull Metrics
          </Tab>
          <Tab
            vertical
            onClick={() => navigate(`/dkr/img/${image.id}/vulnerabilities`)}
            active={pathname.startsWith(`/dkr/img/${image.id}/vulnerabilities`)}
            textDecoration="none"
          >
            Vulnerabilities
          </Tab>
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <ResponsiveLayoutContentContainer>
          <Outlet context={{ image, filter, setFilter }} />
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSidecarContainer width="200px">
          <Codeline marginBottom="xlarge">{`docker pull ${imageName}`}</Codeline>
          <DetailContainer
            title="Metadata"
            pad="small"
            gap="small"
            style={{ overflow: 'hidden' }}
          >
            <PublicSwitch dockerRepo={image.dockerRepository} />
            <PackageProperty header="Created">
              {moment(image.insertedAt).format('lll')}
            </PackageProperty>
            <PackageProperty header="Scanned">
              {image.scannedAt ? moment(image.scannedAt).format('lll') : 'unscanned' }
            </PackageProperty>
            <PackageProperty
              header="Sha"
              style={{ wordWrap: 'break-word' }}
            >
              {image.digest}
            </PackageProperty>
          </DetailContainer>
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Box>
    </Box>
  )
}
