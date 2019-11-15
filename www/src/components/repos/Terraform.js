import React, {useState, useContext, useEffect} from 'react'
import {Box, Text, Markdown, Tabs, Tab} from 'grommet'
import {Alert, Close} from 'grommet-icons'
import {useQuery, useMutation} from 'react-apollo'
import {useParams} from 'react-router-dom'
import {TF_Q, UPDATE_TF, INSTALL_TF, UNINSTALL_TF} from './queries'
import {DEFAULT_TF_ICON} from './constants'
import Highlight from 'react-highlight'
import Installation from './Installation'
import {TerraformForm} from './CreateTerraform'
import {BreadcrumbContext} from '../Chartmart'
import Button, {SecondaryButton} from '../utils/Button'
import Editor from '../utils/Editor'
import Pill from '../utils/Pill'
import yaml from 'js-yaml'


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

function TerraformInstaller({installation, terraformId, terraformInstallation}) {
  const [mutation] = useMutation(terraformInstallation ? UNINSTALL_TF : INSTALL_TF, {
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
    <SecondaryButton round='xsmall' label='Uninstall' pad='small' onClick={mutation} /> :
    <Button round='xsmall' label='Install' pad='small' onClick={mutation} />
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
      <Box width='100px' direction='row' justify='end'>
        <TerraformInstaller
          installation={repository.installation}
          terraformInstallation={installation}
          terraformId={id} />
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

function EditDependencies({id, dependencies}) {
  const [deps, setDeps] = useState(yaml.safeDump(dependencies || {}, null, 2))
  const [notif, setNotif] = useState(false)
  const [mutation, {loading, errors}] = useMutation(UPDATE_TF, {
    variables: {id, attributes: {dependencies: deps}},
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
    <>
    {notif && (
      <Pill background='status-ok' onClose={() => {console.log('wtf'); setNotif(false)}}>
        <Box direction='row' align='center' gap='small'>
          <Text>Configuration saved</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setNotif(false)} />
        </Box>
      </Pill>
    )}
    <Box gap='xsmall' fill='horizontal'>
      <Text size='medium'>Configuration</Text>
      <Box>
        <Editor lang='yaml' value={deps} onChange={setDeps} />
      </Box>
      {errors && (
        <Box direction='row' gap='small'>
          <Alert size='15px' color='notif' />
          <Text size='small' color='notif'>Must be in yml format</Text>
        </Box>)}
      <Box direction='row' justify='end'>
        <Button
          pad={{horizontal: 'medium', vertical: 'xsmall'}}
          loading={loading}
          label='Save'
          onClick={mutation}
          round='xsmall' />
      </Box>
    </Box>
    </>
  )
}

function UpdateTerraform({id, name, description}) {
  const [state, setState] = useState({name: name, description: description})
  const [terraform, setTerraform] = useState(null)
  const [mutation, {loading}] = useMutation(UPDATE_TF, {
    variables: {id, attributes: {...state, package: terraform && terraform.file}},
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
    <Box pad='small'>
      <TerraformForm
        state={state}
        setState={setState}
        terraform={terraform}
        setTerraform={setTerraform}
        mutation={mutation}
        loading={loading}
        update
        label={`Update ${name}`} />
    </Box>
  )
}

function Terraform() {
  const {tfId} = useParams()
  const {loading, data} = useQuery(TF_Q, {variables: {tfId}})
  const width = 60
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
    <Box pad='small' direction='row' height="100%">
      <Box width={`${width}%`} pad='small'>
        <TerraformHeader {...terraformModule} />
        <Tabs justify='start' flex>
          <Tab title='Readme'>
            <Readme {...terraformModule} />
          </Tab>
          <Tab title='Configuration'>
            <TemplateView {...terraformModule} />
          </Tab>
          <Tab title='Dependencies'>
            <EditDependencies {...terraformModule} />
          </Tab>
          {terraformModule.editable && (
            <Tab title='Edit'>
              <UpdateTerraform {...terraformModule} />
            </Tab>
          )}
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