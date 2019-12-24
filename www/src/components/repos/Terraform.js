import React, {useState, useContext, useEffect} from 'react'
import {Box, Text, Markdown} from 'grommet'
import Tabs, {TabHeader, TabHeaderItem, TabContent} from '../utils/Tabs'
import {useQuery, useMutation} from 'react-apollo'
import {useParams, useHistory} from 'react-router-dom'
import {TF_Q, UPDATE_TF, INSTALL_TF, UNINSTALL_TF, DELETE_TF} from './queries'
import {DEFAULT_TF_ICON} from './constants'
import Highlight from 'react-highlight.js'
import Installation from './Installation'
import InputField from '../utils/InputField'
import {BreadcrumbContext} from '../Chartmart'
import Button, {SecondaryButton} from '../utils/Button'
import Dependencies, {FullDependencies, ShowFull} from './Dependencies'
import ScrollableContainer from '../utils/ScrollableContainer'

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
      <Highlight language='terraform'>
        {valuesTemplate || 'no values template'}
      </Highlight>
    </Box>
  )
}

function TerraformInstaller({installation, terraformId, terraformInstallation}) {
  const [mutation, {error}] = useMutation(terraformInstallation ? UNINSTALL_TF : INSTALL_TF, {
    variables: {
      id: terraformInstallation ? terraformInstallation.id : installation.id,
      attributes: {terraformId}
    },
    update: (cache, {data}) => {
      const ti = data.installTerraform ? data.installTerraform : null
      const prev = cache.readQuery({ query: TF_Q, variables: {tfId: terraformId} })
      cache.writeQuery({query: TF_Q, variables: {tfId: terraformId}, data: {
        ...prev,
        terraformModule: {
          ...prev.terraformModule,
          installation: ti
        }
      }})
    }
  })

  return terraformInstallation ?
    <SecondaryButton round='xsmall' label='Uninstall' pad='small' error={error} onClick={mutation} /> :
    <Button round='xsmall' label='Install' pad='small' error={error} onClick={mutation} />
}

function TerraformHeader({id, name, description, installation, repository}) {
  return (
    <Box direction='row' align='center' gap='small' margin={{bottom: 'small'}} style={{minHeight: '50px'}}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={DEFAULT_TF_ICON} />
      </Box>
      <Box width='100%'>
        <Text size='medium'>{name}</Text>
        <Text size='small'><i>{description}</i></Text>
      </Box>
      {repository.installation && (
        <Box width='100px' direction='row' justify='end'>
          <TerraformInstaller
            installation={repository.installation}
            terraformInstallation={installation}
            terraformId={id} />
        </Box>
      )}
    </Box>
  )
}

function Readme({readme}) {
  return (
    <Box gap='small' style={{maxHeight: '100%', overflow: 'auto'}} pad='small'>
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

const LABEL_WIDTH = '90px'

function DeleteTerraform({id}) {
  let history = useHistory()
  const [mutation, {loading}] = useMutation(DELETE_TF, {
    variables: {id},
    onCompleted: () => history.goBack()
  })

  return (
    <Button
      background='status-error'
      loading={loading}
      round='xsmall'
      label='Delete'
      onClick={mutation} />
  )
}

function UpdateTerraform({id, name, description}) {
  const [state, setState] = useState({name: name, description: description})
  const [mutation, {loading}] = useMutation(UPDATE_TF, {
    variables: {id, attributes: {...state}},
    update: (cache, { data: {updateTerraform} }) => {
      const prev = cache.readQuery({query: TF_Q, variables: {tfId: id}})
      cache.writeQuery({query: TF_Q, variables: {tfId: id}, data: {
        ...prev,
        terraformModule: {
          ...prev.terraform,
          ...updateTerraform
        }
      }})
    }
  })

  return (
    <Box pad='medium' gap='small'>
      <InputField
        label='name'
        labelWidth={LABEL_WIDTH}
        placeholder='give it a  name'
        value={state.name}
        onChange={(e) => setState({...state, name: e.target.value})} />
      <InputField
        label='description'
        labelWidth={LABEL_WIDTH}
        placeholder='a helpful description'
        value={state.description}
        onChange={(e) => setState({...state, description: e.target.value})} />
      <Box direction='row' justify='end' gap='small'>
        <DeleteTerraform id={id} />
        <Button loading={loading} round='xsmall' label='Update' onClick={mutation} />
      </Box>
    </Box>
  )
}

function Terraform() {
  const [tab, setTab] = useState(null)
  const [full, setFull] = useState(false)
  const {tfId} = useParams()
  const {loading, data} = useQuery(TF_Q, {variables: {tfId}})
  const width = 65
  const {setBreadcrumbs} = useContext(BreadcrumbContext)

  useEffect(() => {
    if (!data) return
    const {terraformModule} = data
    setBreadcrumbs([
      {url: `/publishers/${terraformModule.repository.publisher.id}`, text: terraformModule.repository.publisher.name},
      {url: `/repositories/${terraformModule.repository.id}`, text: terraformModule.repository.name},
      {url: `/terraform/${terraformModule.id}`, text: terraformModule.name}
    ])
  }, [data, setBreadcrumbs])

  if (loading || !data) return null
  const {terraformModule} = data
  return (
    <ScrollableContainer>
      <Box pad='small' direction='row'>
        <Box width={`${width}%`} pad='small'>
          <TerraformHeader {...terraformModule} />
          <Tabs defaultTab='readme' onTabChange={setTab} headerEnd={tab === 'dependencies' ?
            <ShowFull label={full ? 'Immediate' : 'Full'} onClick={() => setFull(!full)} /> : null
          }>
            <TabHeader>
              <TabHeaderItem name='readme'>
                <Text size='small' style={{fontWeight: 500}}>Readme</Text>
              </TabHeaderItem>
              <TabHeaderItem name='configuration'>
                <Text size='small' style={{fontWeight: 500}}>Configuration</Text>
              </TabHeaderItem>
              <TabHeaderItem name='dependencies'>
                <Text size='small' style={{fontWeight: 500}}>Dependencies</Text>
              </TabHeaderItem>
              {terraformModule.editable && (
                <TabHeaderItem name='edit'>
                  <Text size='small' style={{fontWeight: 500}}>Edit</Text>
                </TabHeaderItem>
              )}
            </TabHeader>
            <TabContent name='readme'>
              <Readme {...terraformModule} />
            </TabContent>
            <TabContent name='configuration'>
              <TemplateView {...terraformModule} />
            </TabContent>
            <TabContent name='dependencies'>
              {full ? <FullDependencies {...terraformModule} /> : <Dependencies {...terraformModule} />}
            </TabContent>
            <TabContent name='edit'>
              <UpdateTerraform {...terraformModule} />
            </TabContent>
          </Tabs>
        </Box>
        <Box pad='small' width={`${100 - width}%`} gap='small'>
          <Installation
            noHelm
            open
            repository={terraformModule.repository}
            onUpdate={updateInstallation(tfId)} />
        </Box>
      </Box>
    </ScrollableContainer>
  )
}

export default Terraform