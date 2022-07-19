/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  EventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ApolloError, useMutation, useQuery } from '@apollo/client'
import {
  Div,
  Flex,
  Form,
  H2,
  Img,
  MenuItem,
  P,
  Select,
  Switch,
} from 'honorable'
import { TextInput } from 'grommet'
import {
  Button,
  CloseIcon,
  FormField,
  Input,
  SearchIcon,
  Tag,
} from 'pluralsh-design-system'
import isEqual from 'lodash/isEqual'
import isArray from 'lodash/isArray'
import uniqWith from 'lodash/uniqWith'
import { useFilePicker } from 'react-sage'
import { filter } from 'lodash'
import styled from '@emotion/styled'

import RepositoryContext from '../../contexts/RepositoryContext'
import { capitalize } from '../../utils/string'
import { generatePreview } from '../../utils/file'
import { AuthMethod as authMethods } from '../oidc/types'

import {
  REPOSITORY_QUERY,
  TAGS_SEARCH_QUERY,
  UPDATE_REPOSITORY_MUTATION,
} from './queries'

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

function useUpdateState<T extends { [key: string]: unknown }>(initialState: T) {
  const [state, setState] = useState({ ...initialState })

  const update = useCallback(
    (update: Partial<T>) => {
      setState({ ...state, ...update })
    },
    [state]
  )
  const reset = useCallback(() => {
    setState({ ...initialState })
  }, [initialState])

  const hasUpdates = useMemo(() => {
    for (const [prop, value] of Object.entries(state)) {
      const curVal = !value && typeof value === 'string' ? null : value
      const initialVal =
        !initialState[prop] && typeof value === 'string'
          ? null
          : initialState[prop]
      if (!isEqual(curVal, initialVal)) {
        return true
      }
    }

    return false
  }, [initialState, state])

  return {
    state: { ...state },
    hasUpdates,
    update,
    reset,
    initialState: { ...initialState },
  }
}

function RepoIcon({
  src = null,
  onClick,
}: {
  src: string | null;
  onClick: EventHandler<any>;
}) {
  if (!src) {
    return (
      <Flex
        width={96}
        height={96}
        backgroundColor="fill-two"
        _hover={{
          backgroundColor: 'fill-two-hover',
        }}
        border="1px solid border-fill-two"
        borderRadius="medium"
        align="center"
        justify="center"
        cursor="pointer"
        onClick={onClick}
      >
        <P
          title2
          color="text-light"
        >
          +
        </P>
      </Flex>
    )
  }

  return (
    <Img
      src={src}
      alt="Icon"
      width={64 + 32}
      height={64 + 32}
      objectFit="cover"
      backgroundColor="fill-one"
      cursor="pointer"
      border="1px solid border"
      onClick={onClick}
    />
  )
}

type FormState = {
  name: string;
  description: string;
  category: string;
  oauthUrl: string;
  oauthMethod: string;
  tags: { name: string }[];
  private: boolean;
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
  } = useContext(RepositoryContext) as any
  const {
    state: formState,
    initialState: formInitialState,
    hasUpdates: formStateHasUpdates,
    update: updateFormState,
    // reset: resetFormState,
  } = useUpdateState<FormState>(
    useMemo(
      () => ({
        name,
        description,
        category,
        oauthUrl:
          typeof oauthSettings?.uriFormat === 'string'
            ? oauthSettings?.uriFormat
            : '',
        oauthMethod:
          typeof oauthSettings?.authMethod === 'string'
            ? oauthSettings?.authMethod
            : authMethods.BASIC,
        tags: isArray(tags) ? tags.map(tag => ({ name: tag.name })) : [],
        private: !!privateRepo,
      }),
      [
        name,
        description,
        oauthSettings?.authMethod,
        oauthSettings?.uriFormat,
        tags,
        privateRepo,
        category,
      ]
    )
  )

  const [tagSearchString, setTagSearchString] = useState('')
  const newTag = tagSearchString
    .replaceAll(/([\s_]+)/gu, '-')
    .replaceAll(/[^A-Za-z-]+/gu, '')
    .toLowerCase()
  const tagSearch = useQuery(TAGS_SEARCH_QUERY, {
    variables: { q: tagSearchString, first: 200 },
  })
  const tagSearchResults: { tag: string; count: number }[] =
    tagSearch?.data?.tags?.edges?.map((edge: any) => edge?.node) || []

  const [iconUpdate, setIconUpdate] = useState<{
    file: File | null;
    previewUrl: string | null;
  }>({ file: null, previewUrl: icon || null })

  const [, setSuccess] = useState(false)
  const [, setError] = useState<ApolloError>()

  const tagSearchRef = useRef<any>(null)

  const [mutation, { loading }] = useMutation(UPDATE_REPOSITORY_MUTATION, {
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
        tags: formState.tags.map(t => ({ tag: t.name })),
        private: formState.private,
      },
    },
    update: (cache, { data: { updateRepository } }) => {
      const prev: any = cache.readQuery({
        query: REPOSITORY_QUERY,
        variables: { repositoryId: id },
      })

      setIconUpdate({ previewUrl: updateRepository.icon || null, file: null })

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
    onError: e => {
      setError(e)
      setSuccess(false)
    },
    onCompleted: () => {
      setSuccess(true)
      setError(undefined)
    },
  })

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
      const reader = generatePreview(
        file,
        (file: { file: File; previewUrl: string }) => {
          if (!preventUpdate) {
            setIconUpdate(file)
          }
        }
      )

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
      tags: filter(formState.tags, tag0 => delTag.name !== tag0.name),
    })
  }

  function handleCreateTag(tagName: string) {
    if (!tagName) return
    const newTags = uniqWith([...formState.tags, { name: tagName }], isEqual)

    updateFormState({
      tags: newTags,
    })
    setTagSearchString('')
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
    <>
      <H2
        title1
        paddingBottom="large"
        borderBottom="1px solid border"
        marginBottom="large"
      >
        Edit
      </H2>
      <Flex
        justifyContent="center"
        border="1px solid border"
        backgroundColor="fill-one"
        borderRadius="large"
        padding="xlarge"
      >
        <Div
          maxWidth={608}
          width="100%"
        >
          <Form
            onSubmit={handleSubmit}
            onReset={e => {
              e.preventDefault()
            }}
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
                <RepoIcon
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
            <FormField
              marginBottom="large"
              label="Name"
            >
              <Input
                placeholder={formInitialState.name}
                value={formState.name}
                onChange={event =>
                  updateFormState({ name: event.target.value })}
              />
            </FormField>
            <Flex
              marginLeft="minus-medium"
              {...{ '& > *': { marginLeft: 'medium' } }}
            >
              <FormField
                marginBottom="large"
                label="Description"
                width="100%"
                flexShrink={1}
                marginLeft="medium"
              >
                <Input
                  multiline
                  minHeight={40}
                  placeholder={formInitialState.description}
                  value={formState.description}
                  onChange={event =>
                    updateFormState({ description: event.target.value })}
                />
              </FormField>
              <FormField
                marginLeft="medium"
                marginBottom="large"
                label="Category"
                width={148}
                flexShrink={1}
              >
                <Select
                  value={formState.category}
                  onChange={event =>
                    updateFormState({ category: event.target.value })}
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
                {formState.tags.map((tag: any) => (
                  <Tag
                    key={tag.name}
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
                    {tag.name}
                    <CloseIcon
                      size={8}
                      marginLeft="xsmall"
                      {...{
                        ':hover &': {
                          color: 'red',
                        },
                      }}
                    />
                  </Tag>
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
                  onChange={event =>
                    updateFormState({ oauthUrl: event.target.value })}
                  placeholder={
                    formInitialState.oauthUrl ||
                    'https://{domain}/oauth/callback'
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
                  onChange={event =>
                    updateFormState({ oauthMethod: event.target.value })}
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
            <Flex
              align="center"
              justify="flex-start"
              marginTop="xlarge"
            >
              {/* <Button
                secondary
                type="reset"
                onClick={handleReset}
              >
                Reset
              </Button> */}
              <Button
                type="submit"
                enabled={submitEnabled}
                disabled={!submitEnabled}
                loading={loading}
              >
                Update
              </Button>
              {formHasUpdates && (
                <Flex
                  marginLeft="medium"
                  alignItems="center"
                  body2
                  color="text-xlight"
                >
                  Unsaved changes
                </Flex>
              )}
            </Flex>
          </Form>
        </Div>
      </Flex>
    </>
  )
}

export default RepositoryEdit
