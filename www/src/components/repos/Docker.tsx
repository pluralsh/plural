// HACK until Select is fixed to admit any ReactNode
// @ts-nocheck
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import moment from 'moment'
import { Box } from 'grommet'

import {
  Codeline,
  GlobeIcon,
  ListBoxFooterPlus,
  ListBoxItem,
  ListBoxItemChipList,
  PadlockLockedIcon,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'

import { GoBack } from '../utils/GoBack'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'

import { LinkTabWrap } from '../utils/Tabs'

import TopBar from '../layout/TopBar'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'

import { LoopingLogo } from '../utils/AnimatedLogo'

import {
  PackageGrade,
  PackageHeader,
  PackageProperty,
  dockerPull,
} from './common/misc'

import { DetailContainer } from './Installation'
import { DEFAULT_DKR_ICON } from './constants'
import { DOCKER_IMG_Q, DOCKER_Q, UPDATE_DOCKER } from './queries'

function PrivateControl({ dockerRepo }: any) {
  const [mutation] = useMutation(UPDATE_DOCKER, { variables: { id: dockerRepo.id } })

  if (!dockerRepo?.repository?.editable) {
    return (
      <Flex
        direction="row"
        gap="xsmall"
        fontWeight="600"
      >
        {dockerRepo.public ? (<><GlobeIcon /> Public</>) : (<><PadlockLockedIcon /> Private</>)}
      </Flex>
    )
  }

  return (
    <Switch
      checked={!dockerRepo.public}
      // @ts-expect-error
      onChange={() => mutation({ variables: { attributes: { public: !dockerRepo.public } } })}
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

const DEFAULT_FILTER = {
  tag: null, precision: '2h', offset: '7d', tick: 'every 12 hours',
}

function ImageVersionPicker({ image }: any) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { dockerRepository } = image
  const [hasNextPage, setHasNextPage] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [allImages, setAllImages] = useState<any[]>([])
  const { data } = useQuery(DOCKER_IMG_Q, {
    variables: {
      dockerRepositoryId: dockerRepository.id,
      cursor,
    },
  })

  const url = pathname.endsWith('vulnerabilities') ? '/vulnerabilities' : ''

  const fetchMore = useCallback(() => {
    if (hasNextPage) {
      setCursor(data.dockerImages.pageInfo.endCursor)
    }
  }, [hasNextPage, data])

  const handleSelectionChange = useCallback((selected: any) => {
    if (selected === '$$footer$$') return

    navigate(`/dkr/img/${selected}${url}`)
  }, [navigate, url])

  useEffect(() => {
    if (data?.dockerImages) {
      setAllImages(x => [...x, ...data.dockerImages.edges.map(({ node }) => node)])
      setHasNextPage(data.dockerImages.pageInfo.hasNextPage)
    }
  }, [data])

  if (!allImages.length) return null

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
        onSelectionChange={handleSelectionChange}
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
        dropdownFooterFixed={(
          hasNextPage && (
            <ListBoxFooterPlus onClick={fetchMore}>
              Fetch more
            </ListBoxFooterPlus>
          )
        )}
      >
        {allImages.map(v => (
          <ListBoxItem
            key={v.id}
            label={v.tag}
            textValue={v.tag}
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

const DIRECTORY = [
  { label: 'Pull metrics', path: '' },
  { label: 'Vulnerabilities', path: '/vulnerabilities' },
]

export function Docker() {
  const { pathname } = useLocation()
  const { id } = useParams()
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const { registry } = useContext(PluralConfigurationContext)
  const tabStateRef = useRef<any>(null)

  const { data } = useQuery(DOCKER_Q, {
    variables: { id, ...filter },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => setFilter(DEFAULT_FILTER), [id])

  if (!data) return <LoopingLogo />

  const { dockerImage: image } = data
  const imageName = dockerPull(registry, { ...image, dockerRepository: image.dockerRepository })

  const pathPrefix = `/dkr/img/${image.id}`
  const currentTab = [...DIRECTORY].sort((a, b) => b.path.length - a.path.length).find(tab => pathname?.startsWith(`${pathPrefix}${tab.path}`))

  return (
    <Box
      direction="column"
      fill
    >
      <TopBar>
        <GoBack
          text="Back to packages"
          link={`/repository/${image.dockerRepository.repository.name}/packages/docker`}
        />
      </TopBar>
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
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'vertical',
              selectedKey: currentTab?.path,
            }}
          >
            {DIRECTORY.map(({ label, textValue, path }: any) => (
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
          <Outlet context={{
            image, imageName, filter, setFilter,
          }}
          />
        </TabPanel>
        <ResponsiveLayoutSidecarContainer width="200px">
          <Codeline marginBottom="large">{`docker pull ${imageName}`}</Codeline>
          <DetailContainer
            title="Metadata"
            pad="small"
            gap="small"
            style={{ overflow: 'hidden' }}
          >
            <PrivateControl dockerRepo={image.dockerRepository} />
            <PackageProperty header="Created">
              {moment(image.updatedAt || image.insertedAt).format('lll')}
            </PackageProperty>
            <PackageProperty header="Scanned">
              {image.scannedAt
                ? moment(image.scannedAt).format('lll')
                : 'unscanned'}
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
