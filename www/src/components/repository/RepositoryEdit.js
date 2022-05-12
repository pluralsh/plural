import { useContext, useState } from 'react'
import { Button, Div, Flex, Form, H2, Input as HonorableInput, MenuItem, P, Select, Tooltip } from 'honorable'
import { FormField, Input, Tag } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'
import { capitalize } from '../../utils/string'

import { AuthMethod as authMethods } from '../oidc/types'

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
  const { name, description, category, editable, oauthSettings, tags } = useContext(RepositoryContext)
  const [nameUpdate, setNameUpdate] = useState(name)
  const [descriptionUpdate, setDescriptionUpdate] = useState(description)
  const [categoryUpdate, setCategoryUpdate] = useState(category)
  const [oauthUrlUpdate, setOauthUrlUpdate] = useState(oauthSettings?.uriFormat || '')
  const [oauthMethodUpdate, setOauthMethodUpdate] = useState(oauthSettings?.authMethod || authMethods.BASIC)
  const [tag, setTag] = useState('')
  const [tagsUpdate, setTagsUpdate] = useState(tags.map(t => t.tag))

  function handleSubmit(event) {
    event.preventDefault()
  }

  function handleReset() {
    setNameUpdate(name)
    setDescriptionUpdate(description)
    setCategoryUpdate(category)
    setOauthUrlUpdate(oauthSettings?.uriFormat || '')
    setOauthMethodUpdate(oauthSettings?.authMethod || authMethods.BASIC)
    setTagsUpdate(tags.map(t => t.tag))
  }

  function handleDeleteTag(tag) {
    setTagsUpdate(tagsUpdate.filter(t => t !== tag))
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

  return (
    <>
      <H2>
        Edit {capitalize(name)}
      </H2>
      <Form
        onSubmit={handleSubmit}
        mt={2}
      >
        <FormField label="Name">
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
          <Flex>
            {tagsUpdate.map(tag => (
              <Tooltip label="Click to remove">
                <Tag
                  key={tag}
                  onClick={() => handleDeleteTag(tag)}
                  pointer="cursor"
                >
                  {tag}
                </Tag>
              </Tooltip>
            ))}
          </Flex>
        </FormField>
        <Flex
          mt={2}
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
            ml={0.5}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </Flex>
      </Form>
    </>
  )
}

export default RepositoryEdit
