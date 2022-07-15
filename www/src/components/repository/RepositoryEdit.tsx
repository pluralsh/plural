import { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Div, Flex, H2, Input as HonorableInput, Img, MenuItem, P, Select, Tooltip, useTheme } from 'honorable'
import { FormField, Input, Tag } from 'pluralsh-design-system'
import { FilePicker } from 'react-file-picker'

import RepositoryContext from '../../contexts/RepositoryContext'
import { capitalize } from '../../utils/string'
import { generatePreview } from '../../utils/file'

import { AuthMethod as authMethods } from '../oidc/types'

import { CREATE_REPOSITORY_MUTATION, REPOSITORY_QUERY } from './queries'

export const categories = [
  'DEVOPS',
  'DATABASE',
  'MESSAGING',
  'SECURITY',
  'DATA',
  'PRODUCTIVITY',
  'NETWORK',
  'STORAGE',
]

function RepositoryEdit() {
  const {
    id,
    name,
    description,
    category,
    editable,
    oauthSettings,
    tags,
    icon,
    darkIcon,
  } = useContext(RepositoryContext)
  const theme = useTheme()
  const [nameUpdate, setNameUpdate] = useState(name)
  const [descriptionUpdate, setDescriptionUpdate] = useState(description)
  const [categoryUpdate, setCategoryUpdate] = useState(category)
  const [oauthUrlUpdate, setOauthUrlUpdate] = useState(oauthSettings?.uriFormat || '')
  const [oauthMethodUpdate, setOauthMethodUpdate] = useState(oauthSettings?.authMethod || authMethods.BASIC)
  const [tag, setTag] = useState('')
  const [tagsUpdate, setTagsUpdate] = useState(tags.map(t => t.tag))
  const [iconUpdate, setIconUpdate] = useState({ file: null, previewUrl: icon })
  const [darkIconUpdate, setdarkIconUpdate] = useState({ file: null, previewUrl: darkIcon })
  const [success, setSuccess] = useState(false)

  const [mutation, { loading }] = useMutation(CREATE_REPOSITORY_MUTATION, {
    variables: {
      repositoryId: id,
      attributes: {
        name: nameUpdate,
        description: descriptionUpdate,
        category: categoryUpdate,
        oauthSettings: {
          uriFormat: oauthUrlUpdate,
          authMethod: oauthMethodUpdate,
        },
        tags: tagsUpdate.map(tag => ({ tag })),
        icon: iconUpdate.file,
        darkIcon: darkIconUpdate.file,
      },
    },
    update: (cache, { data: { updateRepository } }) => {
      console.log('updateRepository', updateRepository)
      const prev = cache.readQuery({ query: REPOSITORY_QUERY, variables: { repositoryId: id } })

      cache.writeQuery({
        query: REPOSITORY_QUERY,
        variables: {
          repositoryId: id,
        },
        data: {
          ...prev,
          repository: {
            ...prev.repository,
            ...updateRepository,
          },
        },
      })
    },
    onCompleted: () => setSuccess(true),
  })

  console.log('success', success)

  function handleSubmit(event) {
    event.preventDefault()
    mutation()
  }

  function handleReset() {
    setNameUpdate(name)
    setDescriptionUpdate(description)
    setCategoryUpdate(category)
    setOauthUrlUpdate(oauthSettings?.uriFormat || '')
    setOauthMethodUpdate(oauthSettings?.authMethod || authMethods.BASIC)
    setTagsUpdate(tags.map(t => t.tag))
    setIconUpdate({ file: null, previewUrl: icon })
    setdarkIconUpdate({ file: null, previewUrl: darkIcon })
  }

  function handleDeleteTag(tag) {
    setTagsUpdate(tagsUpdate.filter(t => t !== tag))
  }

  function handleCreateTag() {
    if (!tag) return

    setTagsUpdate(x => [...x.filter(t => t !== tag), tag])
    setTag('')
  }

  if (!editable) {
    return (
      <H2>
        You cannot edit this repository
      </H2>
    )
  }

  const textStartIcon = (
    <P
      body3
      marginTop={-2}
      color="text-xlight"
    >
      Abc
    </P>
  )

  function renderIcon(src, setSrc, mode) {

    function wrap(node) {
      return (
        <FilePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{ minWidth: 64, maxWidth: 512, minHeight: 64, maxHeight: 512 }}
          onChange={file => generatePreview(file, setSrc)}
        >
          {node}
        </FilePicker>
      )
    }

    if (!src) {
      return wrap(
        <Flex
          width={64 + 32}
          height={64 + 32}
          border="1px solid border"
          align="center"
          justify="center"
          cursor="pointer"
          backgroundColor={mode === 'dark' ? 'fill-one' : 'white'}
        >
          <P
            body0
            color={mode === theme.mode ? 'text' : mode === 'dark' ? 'text' : 'black'}
          >
            +
          </P>
        </Flex>
      )
    }

    return wrap(
      <Img
        src={src}
        alt={name}
        width={64 + 32}
        height={64 + 32}
        objectFit="cover"
        backgroundColor={mode === 'dark' ? 'fill-one' : 'white'}
        cursor="pointer"
        border="1px solid border"
      />
    )
  }

  return (
    <>
      <H2>
        Edit {capitalize(name)}
      </H2>
      <FormField
        mt={2}
        label="Icons"
      >
        <Flex>
          {renderIcon(iconUpdate.previewUrl, setIconUpdate, 'light')}
          <Div ml={1}>
            {renderIcon(darkIconUpdate.previewUrl, setdarkIconUpdate, 'dark')}
          </Div>
        </Flex>
      </FormField>
      <FormField
        mt={1}
        label="Name"
      >
        <Input
          startIcon={textStartIcon}
          placeholder={name}
          value={nameUpdate}
          onChange={event => setNameUpdate(event.target.value)}
        />
      </FormField>
      <FormField
        mt={1}
        label="Description"
      >
        <Input
          multiline
          startIcon={textStartIcon}
          placeholder={description}
          value={descriptionUpdate}
          onChange={event => setDescriptionUpdate(event.target.value)}
        />
      </FormField>
      <FormField
        mt={1}
        label="Category"
      >
        <Select
          value={categoryUpdate}
          onChange={event => setCategoryUpdate(event.target.value)}
        >
          {categories.map(category => (
            <MenuItem
              key={category}
              value={category}
            >
              {capitalize(category.toLocaleLowerCase())}
            </MenuItem>
          ))}
        </Select>
      </FormField>
      <FormField
        mt={1}
        label="OAuth settings"
      >
        <Input
          startIcon={(
            <P
              body3
              marginTop={-2}
              color="text-xlight"
            >
              URL
            </P>
          )}
          value={oauthUrlUpdate}
          onChange={event => setOauthUrlUpdate(event.target.value)}
          placeholder={oauthSettings?.uriFormat || 'https://{domain}/oauth/callback'}
        />
        <Select
          mt={0.5}
          value={oauthMethodUpdate}
          onChange={event => setOauthMethodUpdate(event.target.value)}
        >
          {Object.keys(authMethods).map(method => (
            <MenuItem
              key={method}
              value={method}
            >
              {capitalize(method.toLocaleLowerCase())}
            </MenuItem>
          ))}
        </Select>
      </FormField>
      <FormField
        mt={1}
        label="Tags"
      >
        <Flex
          wrap="wrap"
          align="flex-start"
        >
          {tagsUpdate.map(tag => (
            <Tooltip label="Click to remove">
              <Tag
                key={tag}
                mr={0.5}
                mb={0.5}
                onClick={() => handleDeleteTag(tag)}
                cursor="pointer"
              >
                {tag}
              </Tag>
            </Tooltip>
          ))}
          <HonorableInput
            mt={-0.15}
            ml={-0.25}
            border="none"
            value={tag}
            onChange={event => setTag(event.target.value)}
            onEnter={handleCreateTag}
            placeholder="Add tag"
          />
        </Flex>
      </FormField>
      <Flex
        mt={2}
        pb={6}
        align="center"
        justify="flex-end"
      >
        <Button
          secondary
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          type="submit"
          ml={0.5}
          onClick={handleSubmit}
          loading={loading}
        >
          Update
        </Button>
      </Flex>
    </>
  )
}

export default RepositoryEdit
