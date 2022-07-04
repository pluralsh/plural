import { useCallback, useState } from 'react'
import { Box, Text, TextInput } from 'grommet'
import { Add } from 'grommet-icons'
import { useMutation } from '@apollo/client'
import { Button, SecondaryButton, Select } from 'forge-core'
import { FilePicker } from 'react-file-picker'
import { useNavigate } from 'react-router-dom'

import Toggle from 'react-toggle'

import { generatePreview } from '../../utils/file'
import { appendConnection, updateCache } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'

import { SectionPortal } from '../Explore'
import { AuthMethod } from '../oidc/types'

import { Categories } from './constants'
import { CREATE_REPO, REPOS_Q } from './queries'
import { TagInput } from './Tags'

const LABEL_WIDTH = '90px'

export function LabeledInput({ label, children }) {
  return (
    <Box gap="xsmall">
      <Text
        size="small"
        weight="bold"
      >{label}
      </Text>
      {children}
    </Box>
  )
}

function ImagePicker({ image, setImage, background, label }) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
    >
      <Box
        width="70px"
        height="70px"
        border
        pad="xsmall"
        align="center"
        justify="center"
        background={background}
      >
        {image ? (
          <img
            alt=""
            width="50px"
            height="50px"
            src={image.previewUrl}
          />
        ) :
          <Add size="20px" />}
      </Box>
      <Box gap="xsmall">
        <Text size="small">{image ? image.file.name : 'Select an image'}</Text>
        <FilePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{ minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500 }}
          onChange={file => generatePreview(file, setImage)}
        >
          <SecondaryButton
            round="xsmall"
            label={label || 'Upload an icon'}
          />
        </FilePicker>
      </Box>
    </Box>
  )
}

export function RepoForm({ image, setImage, darkImage, setDarkImage, state, setState, mutation, loading, update, error }) {
  const setOauthSettings = useCallback((key, value) => (
    setState({ ...state, oauthSettings: { ...state.oauthSettings, [key]: value } })
  ), [setState, state])

  return (
    <Box
      fill
      style={{ overflow: 'auto' }}
    >
      <Box
        flex={false}
        pad="medium"
        gap="medium"
      >
        {error && (
          <GqlError
            error={error}
            header="Something went wrong..."
          />
        )}
        <LabeledInput label="1. Upload icons for your repo">
          <Box
            direction="row"
            gap="medium"
          >
            <ImagePicker
              image={image}
              setImage={setImage}
            />
            <ImagePicker
              image={darkImage}
              setImage={setDarkImage}
              background="background"
              label="Darkmode icon (optional)"
            />
          </Box>
        </LabeledInput>
        <LabeledInput label="2. Give it a name">
          <TextInput
            labelWidth={LABEL_WIDTH}
            placeholder="a good name"
            value={state.name}
            onChange={e => setState({ ...state, name: e.target.value })}
          />
        </LabeledInput>
        <LabeledInput label="3. Give it a quick description">
          <TextInput
            label="description"
            labelWidth={LABEL_WIDTH}
            placeholder="a helpful description"
            value={state.description}
            onChange={e => setState({ ...state, description: e.target.value })}
          />
        </LabeledInput>
        <LabeledInput label="4. Select a category for the repo">
          <Select
            size="small"
            value={{ value: state.category, label: state.category.toLowerCase() }}
            options={Object.keys(Categories).map(t => ({ value: t, label: t.toLowerCase() }))}
            onChange={({ value }) => setState({ ...state, category: value })}
          />
        </LabeledInput>
        <LabeledInput label="5. Configure OAuth Settings (if relevant)">
          <Box
            flex={false}
            fill="horizontal"
            gap="xsmall"
          >
            <TextInput
              label="uri format"
              labelWidth={LABEL_WIDTH}
              placeholder="https://{domain}/oauth/callback"
              value={state.oauthSettings.uriFormat || ''}
              onChange={({ target: { value } }) => setOauthSettings('uriFormat', value)}
            />
            <Select
              size="small"
              value={{ value: state.oauthSettings.authMethod, label: state.oauthSettings.authMethod.toLowerCase() }}
              options={Object.keys(AuthMethod).map(t => ({ value: t, label: t.toLowerCase() }))}
              onChange={({ value }) => setOauthSettings('authMethod', value)}
            />
          </Box>
        </LabeledInput>
        <LabeledInput label="6. Add tags as needed">
          <TagInput
            tags={state.tags || []}
            addTag={tag => setState({ ...state, tags: [tag, ...(state.tags || [])] })}
            removeTag={tag => setState({ ...state, tags: state.tags.filter(t => t !== tag) })}
          />
        </LabeledInput>
        <SectionPortal>
          <Box
            direction="row"
            justify="end"
            align="center"
            gap="small"
          >
            <Toggle
              checked={!state.private}
              onChange={({ target: { checked } }) => setState({ ...state, private: !checked })}
            />
            <Text size="small">{state.private ? 'private' : 'public'}</Text>
            <Button
              loading={loading}
              round="xsmall"
              label={update ? 'Update' : 'Create'}
              onClick={mutation}
            />
          </Box>
        </SectionPortal>
      </Box>
    </Box>
  )
}

export default function CreateRepository({ publisher }) {
  const navigate = useNavigate()
  const [state, setState] = useState({
    name: '',
    description: '',
    tags: [],
    private: false,
    category: Categories.DEVOPS,
    oauthSettings: { uriFormat: null, authMethod: AuthMethod.POST },
  })
  const [image, setImage] = useState(null)
  const [darkImage, setDarkImage] = useState(null)
  const { oauthSettings, ...base } = state
  const attributes = { ...base, tags: state.tags.map(t => ({ tag: t })), oauthSettings: oauthSettings.uriFormat ? oauthSettings : null }
  const [mutation, { loading, error }] = useMutation(CREATE_REPO, {
    variables: {
      id: publisher.id,
      attributes: {
        ...attributes, icon: image && image.file, darkIcon: darkImage && darkImage.file,
      },
    },
    update: (cache, { data: { createRepository } }) => updateCache(cache, {
      query: REPOS_Q,
      variables: { publisherId: publisher.id },
      update: prev => appendConnection(prev, createRepository, 'repositories'),
    }),
    onCompleted: () => navigate(`/publishers/${publisher.id}/repos`),
  })

  return (
    <RepoForm
      label="Create a new repository"
      error={error}
      image={image}
      setImage={setImage}
      darkImage={darkImage}
      setDarkImage={setDarkImage}
      state={state}
      setState={setState}
      mutation={mutation}
      loading={loading}
    />
  )
}
