import { useContext, useEffect, useState } from 'react'
import { Links } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import moment from 'moment'
import {
  Anchor, Box, Collapsible, Text,
} from 'grommet'
import { Language } from 'grommet-icons'

import Toggle from 'react-toggle'

import {
  Codeline, ListBoxItem, ListBoxItemChipList, Select, Tab,
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
import { AttackVector, ColorMap, DEFAULT_DKR_ICON } from './constants'
import { DOCKER_IMG_Q, DOCKER_Q, UPDATE_DOCKER } from './queries'

function RepositoryPublic({ dockerRepo }) {
  const pub = dockerRepo.public
  const [mutation] = useMutation(UPDATE_DOCKER, {
    variables: { id: dockerRepo.id },
  })

  if (!dockerRepo.repository.editable && dockerRepo.public) return <Language size="12px" />
  if (!dockerRepo.repository.editable) return null

  return (
    <Box
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Toggle
        checked={pub}
        onChange={({ target: { checked } }) => mutation({
          variables: { attributes: { public: checked } },
        })}
      />
    </Box>
  )
}

function NoVulnerabilities() {
  return (
    <Box
      fill
      justify="center"
      align="center"
    >
      <Text weight="bold">This image is vulnerability free</Text>
    </Box>
  )
}

function VectorSection({ text, background }) {
  return (
    <Box
      pad={{ vertical: 'xsmall' }}
      width="150px"
      background="fill-one"
      align="center"
      justify="center"
      border={background && { side: 'bottom', size: '3px', color: background }}
    >
      <Text size="small">{text}</Text>
    </Box>
  )
}

function CVSSRow({
  text, value, options, colorMap,
}) {
  return (
    <Box
      direction="row"
      align="center"
    >
      <Box
        width="150px"
        flex={false}
      >
        <Text
          size="small"
          weight={500}
        >
          {text}
        </Text>
      </Box>
      <Box
        direction="row"
        fill="horizontal"
        gap="xsmall"
      >
        {options.map(({ name, value: val }) => (
          <VectorSection
            key={name}
            background={value === val ? colorMap[val] : null}
            text={name}
          />
        ))}
      </Box>
    </Box>
  )
}

function VulnerabilityDetail({ vuln }) {
  return (
    <Box
      flex={false}
      pad="small"
      gap="medium"
    >
      <Box
        flex={false}
        gap="small"
      >
        <Text
          size="small"
          weight={500}
        >{vuln.title}
        </Text>
        <Text size="small">{vuln.description}</Text>
      </Box>
      <Box
        flex={false}
        gap="small"
      >
        <Box
          direction="row"
          gap="xsmall"
        >
          <Text
            size="small"
            weight={500}
          >CVSS V3 Vector
          </Text>
          <Text size="small">(source {vuln.source}, score: <b>{vuln.score}</b>)</Text>
        </Box>
        {vuln.cvss && (
          <Box
            flex={false}
            gap="small"
          >
            <Text
              size="small"
              weight={500}
            >EXPLOITABILITY METRICS
            </Text>
            <Box
              flex={false}
              gap="xsmall"
            >
              <CVSSRow
                text="Attack Vector"
                value={vuln.cvss.attackVector}
                options={[
                  { name: 'Physical', value: AttackVector.PHYSICAL },
                  { name: 'Local', value: AttackVector.LOCAL },
                  { name: 'Adjacent Network', value: AttackVector.ADJACENT },
                  { name: 'Network', value: AttackVector.NETWORK },
                ]}
                colorMap={ColorMap}
              />
              <CVSSRow
                text="Attack Complexity"
                value={vuln.cvss.attackComplexity}
                options={[
                  { name: 'High', value: 'HIGH' },
                  { name: 'Low', value: 'LOW' },
                ]}
                colorMap={{ HIGH: 'low', LOW: 'high' }}
              />
              <CVSSRow
                text="Privileges Required"
                value={vuln.cvss.privilegesRequired}
                options={[
                  { name: 'High', value: 'HIGH' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'None', value: 'NONE' },
                ]}
                colorMap={{ HIGH: 'low', LOW: 'high', NONE: 'critical' }}
              />
              <CVSSRow
                text="User Interaction"
                value={vuln.cvss.userInteraction}
                options={[
                  { name: 'Required', value: 'REQUIRED' },
                  { name: 'None', value: 'NONE' },
                ]}
                colorMap={{ REQUIRED: 'low', NONE: 'high' }}
              />
            </Box>
            <Text
              size="small"
              weight={500}
            >IMPACT METRICS
            </Text>
            <Box
              flex={false}
              gap="xsmall"
            >
              <CVSSRow
                text="Confidentiality"
                value={vuln.cvss.confidentiality}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
              <CVSSRow
                text="Integrity"
                value={vuln.cvss.integrity}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
              <CVSSRow
                text="Availability"
                value={vuln.cvss.availability}
                options={[
                  { name: 'None', value: 'NONE' },
                  { name: 'Low', value: 'LOW' },
                  { name: 'High', value: 'HIGH' },
                ]}
                colorMap={{ NONE: 'low', LOW: 'medium', HIGH: 'high' }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function Vulnerability({ vuln }) {
  const [open, setOpen] = useState(false)

  return (
    <Box
      flex={false}
      border={{ side: 'bottom', color: 'border' }}
    >
      <Box
        direction="row"
        gap="small"
        align="center"
        pad="xsmall"
        onClick={() => setOpen(!open)}
        hoverIndicator="fill-one"
        focusIndicator={false}
      >
        <Box
          width="30%"
          direction="row"
          gap="small"
        >
          <Text
            size="small"
            weight={500}
          >{vuln.vulnerabilityId}
          </Text>
          {vuln.url && (
            <Anchor
              size="small"
              href={vuln.url}
              target="_blank"
            ><Links size="small" />
            </Anchor>
          )}
        </Box>
        <Box
          flex={false}
          width="15%"
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Box
            width="15px"
            height="15px"
            round="xsmall"
            background={ColorMap[vuln.severity]}
          />
          <Text size="small">{vuln.severity}</Text>
        </Box>
        <HeaderItem
          text={vuln.package}
          width="25%"
          nobold
        />
        <HeaderItem
          text={vuln.installedVersion}
          width="15%"
          nobold
        />
        <HeaderItem
          text={vuln.fixedVersion}
          width="15%"
          nobold
        />
      </Box>
      <Collapsible open={open}>
        <VulnerabilityDetail vuln={vuln} />
      </Collapsible>
    </Box>
  )
}

export function HeaderItem({
  text, width, nobold, truncate,
}) {
  return (
    <Box width={width}>
      <Text
        size="small"
        weight={nobold ? null : 500}
        truncate={truncate}
      >
        {text}
      </Text>
    </Box>
  )
}

function VulnerabilityHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      pad="xsmall"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
    >
      <HeaderItem
        text="ID"
        width="30%"
      />
      <HeaderItem
        text="Severity"
        width="15%"
      />
      <HeaderItem
        text="Package"
        width="25%"
      />
      <HeaderItem
        text="Version"
        width="15%"
      />
      <HeaderItem
        text="Fixed Version"
        width="15%"
      />
    </Box>
  )
}

function Vulnerabilities({ image: { vulnerabilities } }) {
  if (!vulnerabilities || vulnerabilities.length === 0) return <NoVulnerabilities />

  return (
    <Box
      style={{ overflow: 'auto' }}
      fill
    >
      <VulnerabilityHeader />
      {vulnerabilities.map(vuln => (
        <Vulnerability
          key={vuln.id}
          vuln={vuln}
        />
      ))}
    </Box>
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

  return (
    <Box
      direction="column"
      fill
    >
      <GoBack
        text="Back to packages"
        link={`/repository/${image.dockerRepository.id}/packages/docker`}
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
          <Outlet context={{ dockerRepository: image.dockerRepository, filter, setFilter }} />
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSidecarContainer width="200px">
          <Codeline marginBottom="xlarge">{`docker pull ${imageName}`}</Codeline>
          <DetailContainer
            title="Metadata"
            pad="small"
            gap="small"
            style={{ overflow: 'hidden' }}
          >
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
            <PackageProperty header="Public">
              <RepositoryPublic dockerRepo={image.dockerRepository} />
            </PackageProperty>
          </DetailContainer>
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Box>
    </Box>
  )
}
