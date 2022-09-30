import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  Div,
  Flex,
  Form,
  H2,
  MenuItem,
  Select,
  Span,
  Switch,
} from 'honorable'
import { TextInput } from 'grommet'
import {
  Button,
  Chip,
  CloseIcon,
  ContentCard,
  FormField,
  Input,
  PageTitle,
  SearchIcon,
} from 'pluralsh-design-system'
import isEqual from 'lodash/isEqual'
import isArray from 'lodash/isArray'
import uniqWith from 'lodash/uniqWith'
import { useFilePicker } from 'react-sage'
import filter from 'lodash/filter'
import styled from '@emotion/styled'
import capitalize from 'lodash/capitalize'

import RepositoryContext from '../../contexts/RepositoryContext'
import { isValidUrl } from '../../utils/string'
import { generatePreview } from '../../utils/file'
import { AuthMethod as authMethods } from '../oidc/types'
import { useUpdateState } from '../../hooks/useUpdateState'

import SaveButton from '../utils/SaveButton'
import IconUploadPreview from '../utils/IconUploadPreview'

import { TAGS_SEARCH_QUERY, UPDATE_REPOSITORY_MUTATION } from './queries'
import { RepositoryActions } from './misc'

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

const StyledTextInput = styled(TextInput)`
  border: 1px solid #454954;
  border-radius: 3px;
  &:focus {
    border-color: #5c77ff;
  }
`

type FormState = {
  name: string;
  description: string;
  category: string;
  oauthUrl: string;
  oauthMethod: string;
  tags: { tag: string }[];
  private: boolean;
  websiteUrl: string;
  docsUrl: string;
  githubUrl: string;
  discordUrl: string;
  slackUrl: string;
  twitterUrl: string;
};

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
    private: privateRepo,
    websiteUrl,
    docsUrl,
    githubUrl,
    discordUrl,
    slackUrl,
    twitterUrl,
  } = useContext(RepositoryContext) as any
  const {
    state: formState,
    initialState: formInitialState,
    hasUpdates: formStateHasUpdates,
    update: updateFormState,
    errors: formStateErrors,
    updateErrors: updateFormStateErrors,
    // reset: resetFormState,
  } = useUpdateState<FormState>(useMemo(() => ({
    name: name || '',
    description: description || '',
    category: category || '',
    oauthUrl: oauthSettings?.uriFormat || '',
    oauthMethod: `${oauthSettings?.authMethod || authMethods.BASIC}`,
    tags: isArray(tags) ? tags.map(tag => ({ tag: tag.tag })) : [],
    private: !!privateRepo,
    websiteUrl: websiteUrl || '',
    docsUrl: docsUrl || '',
    githubUrl: githubUrl || '',
    discordUrl: discordUrl || '',
    slackUrl: slackUrl || '',
    twitterUrl: twitterUrl || '',
  }),
  [
    name,
    description,
    oauthSettings?.authMethod,
    oauthSettings?.uriFormat,
    tags,
    privateRepo,
    category,
    websiteUrl,
    docsUrl,
    githubUrl,
    discordUrl,
    slackUrl,
    twitterUrl,
  ]))

  const [tagSearchString, setTagSearchString] = useState('')
  const newTag = tagSearchString
    .replaceAll(/([\s_]+)/gu, '-')
    .replaceAll(/[^A-Za-z-]+/gu, '')
    .toLowerCase()
  const tagSearch = useQuery(TAGS_SEARCH_QUERY, {
    variables: { q: tagSearchString, first: 200 },
  })
  const tagSearchResults: { tag: string; count: number }[]
    = tagSearch?.data?.tags?.edges?.map((edge: any) => edge?.node) || []

  const [iconUpdate, setIconUpdate] = useState<{
    file: File | null;
    previewUrl: string | null;
  }>({ file: null, previewUrl: icon || null })

  const tagSearchRef = useRef<any>(null)

  const [mutation, { loading, error }] = useMutation(UPDATE_REPOSITORY_MUTATION, {
    variables: {
      repositoryId: id,
      attributes: {
        name: formState.name,
        description: formState.description,
        category: formState.category,
        oauthSettings:
          formState.oauthUrl && formState.oauthMethod
            ? {
              uriFormat: formState.oauthUrl,
              authMethod: formState.oauthMethod,
            }
            : null,
        ...(iconUpdate.file ? { icon: iconUpdate.file } : {}),
        tags: formState.tags,
        private: formState.private,
        websiteUrl: formState.websiteUrl,
        docsUrl: formState.docsUrl,
        githubUrl: formState.githubUrl,
        discordUrl: formState.discordUrl,
        slackUrl: formState.slackUrl,
        twitterUrl: formState.twitterUrl,
      },
    },
    update: (_cache, { data: { updateRepository } }) => {
      setIconUpdate({
        previewUrl: updateRepository.icon || null,
        file: null,
      })
    },
  })

  console.log('Error: ', error)

  const iconPicker = useFilePicker({
    minImageWidth: 64,
    maxImageWidth: 512,
    minImageHeight: 64,
    maxImageHeight: 512,
  })
  const iconPickerInputOpts = {
    multiple: false,
    accept: 'image/jpeg,image/png',
  }

  useEffect(() => {
    const preventUpdate = false
    const file = isArray(iconPicker?.files) && iconPicker?.files[0]

    if (file) {
      const reader = generatePreview(file,
        (file: { file: File; previewUrl: string }) => {
          if (!preventUpdate) {
            setIconUpdate(file)
          }
        })

      return () => {
        reader.abort()
      }
    }
  }, [iconPicker.files])

  function handleSubmit(event: React.SyntheticEvent<HTMLElement>) {
    event.preventDefault()
    if (!formState.oauthUrl) {
      updateFormState({ oauthMethod: authMethods.BASIC })
    }
    mutation()
  }

  // function handleReset() {
  //   resetFormState()
  //   setIconUpdate({ file: null, previewUrl: icon })
  // }

  function handleDeleteTag(delTag: FormState['tags'][number]) {
    updateFormState({
      tags: filter(formState.tags, tag0 => delTag.tag !== tag0.tag),
    })
  }

  function handleCreateTag(tagName: string) {
    if (!tagName) return
    const newTags = uniqWith([...formState.tags, { tag: tagName }], isEqual)

    updateFormState({
      tags: newTags,
    })
    setTagSearchString('')
  }

  function renderUrlField(key: string,
    label: string,
    placeholder: string) {
    return (
      <FormField
        label={label}
        error={formStateErrors[key]}
        hint={formStateErrors[key] ? 'Must be a valid URL' : ''}
        marginBottom="large"
        flexGrow={1}
      >
        <Input
          value={formState[key]}
          error={formStateErrors[key]}
          onChange={event => {
            updateFormState({ [key]: event.target.value })
            updateFormStateErrors({
              [key]: !!event.target.value && isValidUrl(event.target.value),
            })
          }}
          placeholder={placeholder}
        />
      </FormField>
    )
  }

  if (!editable) {
    return <H2>You cannot edit this repository</H2>
  }

  const formHasUpdates = formStateHasUpdates || icon !== iconUpdate.previewUrl
  const submitEnabled = formHasUpdates

  const suggestions = tagSearchResults.map((tag, index) => ({
    value: tag.tag,
    label: (
      <MenuItem
        key={tag.tag}
        body2
        marginTop={index === 0 ? 'xxsmall' : 0}
        backgroundColor="fill-two"
        borderBottom="1px solid border-fill-two"
        _hover={{
          backgroundColor: 'fill-two-hover',
        }}
        color="text"
      >
        {tag.tag}
      </MenuItem>
    ),
  }))

  if (newTag) {
    suggestions.push({
      value: newTag,
      label: (
        <Flex
          direction="row"
          body2
          backgroundColor="fill-two"
          paddingVertical="small"
          paddingHorizontal="medium"
          _hover={{
            backgroundColor: 'fill-two-hover',
          }}
          color="text-primary-accent"
        >
          <Div
            fontSize="26px"
            paddingRight="medium"
            position="relative"
            marginTop="-0.1em"
            marginRight="-0.15em"
          >
            +
          </Div>
          Create new tag, &ldquo;{newTag}&rdquo;
        </Flex>
      ),
    })
  }

  return (
    <Form
      onSubmit={event => {
        event.preventDefault()
        if (formHasUpdates) {
          mutation()
        }
      }}
      maxHeight="100%"
      display="flex"
      flexDirection="column"
    >
      <PageTitle
        heading="Edit"
        paddingTop="medium"
      >
        <Flex
          align="center"
          gap="medium"
        >
          <SaveButton
            type="submit"
            dirty={formHasUpdates}
            enabled={submitEnabled}
            disabled={!submitEnabled || Object.keys(formStateErrors).some(key => formStateErrors[key])}
            loading={loading}
          />
          <Flex display-desktop-up="none"><RepositoryActions /></Flex>
        </Flex>
      </PageTitle>
      <ContentCard
        marginBottom="xlarge"
        overflow="auto"
      >
        <Div
          maxWidth={608}
          width="100%"
        >
          <Form
            onSubmit={handleSubmit}
            onReset={e => e.preventDefault()}
          >
            {iconPicker.HiddenFileInput(iconPickerInputOpts)}
            <FormField
              marginBottom="large"
              label="Icon"
            >
              <Flex
                direction="row"
                alignItems="flex-end"
                gap="medium"
              >
                <IconUploadPreview
                  src={iconUpdate.previewUrl}
                  onClick={iconPicker.onClick}
                />
                <Flex
                  direction="column"
                  gap="xsmall"
                >
                  <Button
                    type="button"
                    secondary
                    small
                    minHeight="auto"
                    onClick={iconPicker.onClick}
                  >
                    {iconUpdate.previewUrl ? 'Switch' : 'Upload'}
                  </Button>
                  {iconUpdate.previewUrl && (
                    <Button
                      type="button"
                      secondary
                      small
                      minHeight="auto"
                      destructive
                      onClick={() => {
                        setIconUpdate({ file: null, previewUrl: null })
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Flex>
              </Flex>
            </FormField>
            <Flex
              gap="medium"
              marginBottom="large"
            >
              <FormField
                label="Name"
                flexGrow={1}
              >
                <Input
                  placeholder={formInitialState.name}
                  value={formState.name}
                  onChange={event => updateFormState({ name: event.target.value })}
                />
              </FormField>
              <FormField
                label="Category"
                width={148}
                flexShrink={1}
              >
                <Select
                  value={formState.category}
                  onChange={event => updateFormState({ category: event.target.value })}
                  width="100%"
                  minHeight={40}
                  minWidth="auto"
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
            </Flex>
            <FormField
              marginBottom="large"
              label="Description"
              width="100%"
              length={formState.description.length}
              maxLength={200}
            >
              <Input
                multiline
                minRows={3}
                placeholder={formInitialState.description}
                value={formState.description}
                onChange={event => updateFormState({ description: event.target.value.substring(0, 200) })}
              />
            </FormField>
            <Flex gap="medium">
              {renderUrlField('websiteUrl', 'Website link', 'Website URL',)}
              {renderUrlField('docsUrl', 'Docs link', 'Docs URL',)}
            </Flex>
            <Flex gap="medium">
              {renderUrlField('githubUrl', 'GitHub link', 'GitHub URL',)}
              {renderUrlField('discordUrl', 'Discord link', 'Discord invite URL',)}
            </Flex>
            <Flex gap="medium">
              {renderUrlField('slackUrl', 'Slack link', 'Slack invite URL',)}
              {renderUrlField('twitterUrl', 'Twitter link', 'Twitter URL',)}
            </Flex>
            <FormField
              marginBottom="large"
              label="Tags"
            >
              <StyledTextInput
                style={{}}
                ref={tagSearchRef}
                icon={<SearchIcon size={12} />}
                placeholder="Search for tags"
                value={tagSearchString}
                suggestions={suggestions}
                dropHeight="200px"
                onSelect={event => {
                  tagSearchRef?.current?.blur()
                  handleCreateTag(event?.suggestion?.value)
                }}
                onChange={event => setTagSearchString(event?.target?.value)}
              />
              <Flex
                wrap="wrap"
                align="flex-start"
                gap="xsmall"
                marginTop="small"
              >
                {formState.tags.map(tag => (
                  <Chip
                    key={tag.tag}
                    onClick={() => handleDeleteTag(tag)}
                    backgroundColor="fill-two"
                    _hover={{
                      backgroundColor: 'fill-two-hover',
                      '& svg': {
                        color: 'text',
                      },
                    }}
                    cursor="pointer"
                  >
                    <Span fontWeight="400">{tag.tag}</Span>
                    <CloseIcon
                      size={8}
                      marginLeft="xsmall"
                      {...{
                        ':hover &': {
                          color: 'red',
                        },
                      }}
                    />
                  </Chip>
                ))}
              </Flex>
            </FormField>

            <Flex
              marginLeft="minus-medium"
              alignItems="stretch"
              alignContent="stretch"
              flexWrap=""
            >
              <FormField
                label="OAuth settings"
                hint="This must be a valid url beginning with https://"
                width="100%"
                marginLeft="medium"
                marginBottom="large"
              >
                <Input
                  value={formState.oauthUrl}
                  onChange={event => updateFormState({ oauthUrl: event.target.value })}
                  placeholder={
                    formInitialState.oauthUrl
                    || 'https://{domain}/oauth/callback'
                  }
                />
              </FormField>
              <FormField
                label="HTTP method"
                width={148}
                flexShrink={1}
                marginLeft="medium"
                marginBottom="large"
              >
                <Select
                  width="100%"
                  minWidth="auto"
                  minHeight={40}
                  value={formState.oauthMethod}
                  onChange={event => updateFormState({ oauthMethod: event.target.value })}
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
            </Flex>

            <Div paddingVertical={10}>
              <Switch
                padding={0}
                checked={formState.private || false}
                onChange={({ target: { checked } }) => {
                  updateFormState({ private: checked })
                }}
              >
                Private repository
              </Switch>
            </Div>
          </Form>
        </Div>
      </ContentCard>
    </Form>
  )
}

export default RepositoryEdit
