import React from 'react'
import {Box, Text, Markdown, Tabs, Tab} from 'grommet'
import {useQuery} from 'react-apollo'
import {useParams} from 'react-router-dom'
import {TF_Q} from './queries'
import {DEFAULT_TF_ICON} from './constants'
import Highlight from 'react-highlight'
import Installation from './Installation'

function Code({value, children, language}) {
  return (
    <Highlight language={language || 'sh'}>
      {value || children}
    </Highlight>
  )
}

const MARKDOWN_STYLING = {
  p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}},
  h1: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'small', margin: {top: 'small', bottom: 'small'}}},
  h2: {props: {style: {borderBottom: '1px solid #eaecef', paddingBottom: '.3em', maxWidth: '100%'}, size: 'xsmall', margin: {top: 'small', bottom: 'small'}}},
  pre: {
    component: Code,
    props: {}
  }
}

function TemplateView({valuesTemplate}) {
  return (
    <Box style={{overflow: 'auto', maxHeight: '100%'}}>
      <Highlight language='tf'>
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
}

function TerraformHeader({name, description}) {
  return (
    <Box direction='row' align='center' gap='small' margin={{bottom: 'small'}} style={{minHeight: '50px'}}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_TF_ICON} />
      </Box>
      <Box>
        <Text size='medium'>{name}</Text>
        <Text size='small'><i>{description}</i></Text>
      </Box>
    </Box>
  )
}

function Readme({readme}) {
  return (
    <Box gap='small' style={{maxHeight: '100%', overflow: 'auto'}}>
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
    const prev = cache.readQuery({query: TF_Q, variables: {tfId}})
    cache.writeQuery({
      query: TF_Q,
      variables: {tfId},
      data: {
        ...prev,
        terraformModule: {
          ...prev.terraformModule,
          repository: {...prev.terraformModule.repository, installation: installation}}
        }
    })
  }
}

function Terraform() {
  const {tfId} = useParams()
  const {loading, data} = useQuery(TF_Q, {variables: {tfId}})

  if (loading || !data) return null

  const {terraformModule} = data
  const width = 60
  return (
    <Box pad='small' direction='row' height="100%">
      <Box width={`${width}%`} pad='small' border='right'>
        <TerraformHeader {...terraformModule} />
        <Tabs justify='start' flex>
          <Tab title='Readme'>
            <Readme {...terraformModule} />
          </Tab>
          <Tab title='Configuration'>
            <TemplateView {...terraformModule} />
          </Tab>
        </Tabs>
      </Box>
      <Box pad='small' width={`${100 - width}%`} gap='small'>
        <Installation
          noHelm
          repository={terraformModule.repository}
          onUpdate={updateInstallation(tfId)} />
      </Box>
    </Box>
  )
}

export default Terraform