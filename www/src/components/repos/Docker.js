import React, { useContext, useEffect, useState } from 'react'
import { Loading, Tabs, TabHeader, TabHeaderItem, TabContent } from 'forge-core'
import { useQuery } from 'react-apollo'
import { useParams } from 'react-router'
import { DOCKER_Q } from './queries'
import { AttackVector, ColorMap, DEFAULT_DKR_ICON, DKR_DNS } from './constants'
import { DetailContainer } from './Installation'
import moment from 'moment'
import { Anchor, Box, Collapsible, Text } from 'grommet'
import { Link } from 'grommet-icons'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { DockerImages } from './Repository'

function DockerHeader({image}) {
  return (
    <Box flex={false} direction='row' align='center' gap='medium'>
      <Box flex={false} width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_DKR_ICON} />
      </Box>
      <Box fill='horizontal'>
        <Text size='medium'>{image.dockerRepository.name}:{image.tag}</Text>
        <Text size='small' color='dark-3'>{image.digest}</Text>
      </Box>
      <Box flex={false}>
        <GradeNub text={image.grade} severity={image.grade} />
      </Box>
    </Box>
  )
}

function DockerSidebar({image: {dockerRepository: docker, ...image}}) {
  return (
    <DetailContainer pad='small' gap='small' >
      <Text weight="bold" size='small'>Pull Command</Text>
      <Box background='sidebar' pad='xsmall'>
        <pre>docker pull {DKR_DNS}/{docker.repository.name}/{docker.name}:{image.tag}</pre>
      </Box>

      <Text weight="bold" size='small'>Created At</Text>
      <Text size='small'>{moment(image.insertedAt).format('lll')}</Text>
    </DetailContainer>
  )
}

function NoVulnerabilities() {
  return (
    <Box fill justify='center' align='center'>
      <Text weight='bold'>This image is vulnerability free</Text>
    </Box>
  )
}

function TableItem({text, children}) {
  return (
    <Box direction='row' gap='xsmall' align='center'>
      <Box width='30%'>
        <Text size='small' weight={500}>{text}</Text>
      </Box>
      <Box fill='horizontal'>
        {children}
      </Box>
    </Box>
  )
}

export function GradeNub({text, severity}) {
  return (
    <Box flex={false} pad={{horizontal: 'xsmall', vertical: 'xxsmall'}} background={ColorMap[severity]}
         align='center' justify='center' round='xsmall' width='75px' >
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function VectorSection({text, background}) {
  return (
    <Box pad={{vertical: 'xsmall'}} width='150px' background='light-1' 
        align='center' justify='center' border={background && {side: 'bottom', size: '3px', color: background}}>
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function CVSSRow({text, value, options, colorMap}) {
  return (
    <Box direction='row' align='center'>
      <Box width='150px' flex={false}><Text size='small' weight={500}>{text}</Text></Box>
      <Box direction='row' fill='horizontal' gap='xsmall'>
        {options.map(({name, value: val}) => (
          <VectorSection key={name} background={value === val ? colorMap[val] : null} text={name} />
        ))}
      </Box>
    </Box>
  )
}

function VulnerabilityDetail({vuln}) {
  return (
    <Box flex={false} pad='small' gap='medium'>
      <Box flex={false} gap='small'>
        <Text size='small' weight={500}>{vuln.title}</Text>
        <Text size='small'>{vuln.description}</Text>
      </Box>
      <Box flex={false} gap='small'>
        <Box direction='row' gap='xsmall'>
          <Text size='small' weight={500}>CVSS V3 Vector</Text>
          <Text size='small'>(source {vuln.source}, score: <b>{vuln.score}</b>)</Text>
        </Box>
        <Text size='small'>EXPLOITABILITY METRICS</Text>
        <Box flex={false} gap='xsmall'>
          <CVSSRow text='Attack Vector' value={vuln.cvss.attackVector} options={[
            {name: 'Physical', value: AttackVector.PHYSICAL},
            {name: 'Local', value: AttackVector.LOCAL},
            {name: "Adjacent Network", value: AttackVector.ADJACENT},
            {name: "Network", value: AttackVector.NETWORK}
          ]} colorMap={ColorMap} />
          <CVSSRow text='Attack Complexity' value={vuln.cvss.attackComplexity} options={[
            {name: 'High', value: 'HIGH'},
            {name: 'Low', value: "LOW"}
          ]} colorMap={{'HIGH': 'low', 'LOW': 'high'}}/>
          <CVSSRow text='Privileges Required' value={vuln.cvss.privilegesRequired} options={[
            {name: 'High', value: 'HIGH'},
            {name: 'Low', value: "LOW"},
            {name: 'None', value: "NONE"}
          ]} colorMap={{'HIGH': 'low', 'LOW': 'medium', 'NONE': 'high'}}/>
          <CVSSRow text='User Interaction' value={vuln.cvss.userInteraction} options={[
            {name: 'Required', value: 'REQUIRED'},
            {name: 'None', value: "NONE"}
          ]} colorMap={{'REQUIRED': 'low', 'NONE': 'high'}}/>
        </Box>
        <Text size='small' weight={500}>IMPACT METRICS</Text>
        <Box flex={false} gap='xsmall'>
          <CVSSRow text='Confidentiality' value={vuln.cvss.confidentiality} options={[
            {name: 'None', value: 'NONE'},
            {name: 'Low', value: "LOW"},
            {name: 'High', value: 'HIGH'}
          ]} colorMap={{'NONE': 'low', 'LOW': 'medium', 'HIGH': 'high'}}/>
          <CVSSRow text='Integrity' value={vuln.cvss.integrity} options={[
            {name: 'None', value: 'NONE'},
            {name: 'Low', value: "LOW"},
            {name: 'High', value: 'HIGH'}
          ]} colorMap={{'NONE': 'low', 'LOW': 'medium', 'HIGH': 'high'}}/>
          <CVSSRow text='Availability' value={vuln.cvss.availability} options={[
            {name: 'None', value: 'NONE'},
            {name: 'Low', value: "LOW"},
            {name: 'High', value: 'HIGH'}
          ]} colorMap={{'NONE': 'low', 'LOW': 'medium', 'HIGH': 'high'}}/>
        </Box>
      </Box>
    </Box>
  )
}

function Vulnerability({vuln}) {
  const [open, setOpen] = useState(false)
  return (
    <Box flex={false} border={{side: 'bottom', color: 'light-3'}}>
      <Box direction='row' gap='small' align='center' pad={{vertical: 'xsmall'}} onClick={() => setOpen(!open)} hoverIndicator='light-3' >
        <Box width='30%' direction='row' gap='small'>
          <Text size='small' weight={500}>{vuln.vulnerabilityId}</Text>
          {vuln.url && <Anchor size='small' href={vuln.url}><Link size='small' /></Anchor>}
        </Box>
        <Box width='10%' direction='row' gap='xsmall' align='center'>
          <Box width='15px' height='15px' round='xsmall' background={ColorMap[vuln.severity]} />
          <Text size='small'>{vuln.severity}</Text>
        </Box>
        <HeaderItem text={vuln.package} width='30%' nobold />
        <HeaderItem text={vuln.installedVersion} width='15%' nobold />
        <HeaderItem text={vuln.fixedVersion} width='15%' nobold />
      </Box>
      <Collapsible open={open}>
        <VulnerabilityDetail vuln={vuln} />
      </Collapsible>
    </Box>
  )
}

const HeaderItem = ({text, width, nobold}) => (<Box width={width}><Text size='small' weight={nobold ? null : 500}>{text}</Text></Box>)

function VulnerabilityHeader() {
  return (
    <Box flex={false} direction='row' border={{side: 'bottom', color: 'light-5'}} align='center'>
      <HeaderItem text='ID' width='30%' />
      <HeaderItem text='Severity' width='10%' />
      <HeaderItem text='Package' width='30%' />
      <HeaderItem text='Version' width='15%' />
      <HeaderItem text='Fixed Version' width='15%' />
    </Box>
  )
}

function Vulnerabilities({image: {vulnerabilities, ...image}}) {
  if (!vulnerabilities || vulnerabilities.length === 0) return <NoVulnerabilities />

  return (
    <Box style={{overflow: 'auto'}} fill pad='small'>
      <VulnerabilityHeader />
      {vulnerabilities.map((vuln) => (
        <Vulnerability key={vuln.id} vuln={vuln} />
      ))}
    </Box>
  )
}

export function Docker() {
  const {id} = useParams()
  const {data} = useQuery(DOCKER_Q, {variables: {id}, fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!data) return
    const {dockerImage} = data
    const repository = dockerImage.dockerRepository.repository
    setBreadcrumbs([
      {url: `/repositories/${repository.id}`, text: repository.name},
      {url: `/docker/${dockerImage.id}`, text: `${dockerImage.dockerRepository.name}`}
    ])
  }, [data, setBreadcrumbs])

  if (!data) return <Loading />

  const {dockerImage: image} = data
  return (
    <Box fill direction='row'>
      <Box fill width='70%' pad='small' gap='small'>
        <DockerHeader image={image} />
        <Box fill>
          <Tabs defaultTab='imgs'>
            <TabHeader>
              <TabHeaderItem name='imgs'>
                <Text weight={500} size='small'>Images</Text>
              </TabHeaderItem>
              <TabHeaderItem name='vulns'>
                <Text weight={500} size='small'>Vulnerabilities</Text>
              </TabHeaderItem>
            </TabHeader>
            <TabContent name='imgs'>
              <DockerImages dockerRepository={image.dockerRepository} />
            </TabContent>
            <TabContent name='vulns'>
              <Vulnerabilities image={image} />
            </TabContent>
          </Tabs>
        </Box>
      </Box>
      <Box flex={false} fill='vertical' pad='small'>
        <DockerSidebar image={image} />
      </Box>
    </Box>
  )
}