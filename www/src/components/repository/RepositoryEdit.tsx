import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  Button,
  Chip,
  ComboBox,
  ContentCard,
  FormField,
  Input,
  ListBoxFooterPlus,
  ListBoxItem,
  PageTitle,
  Select,
  Switch,
} from '@pluralsh/design-system'
import isEqual from 'lodash/isEqual'
import isArray from 'lodash/isArray'
import uniqWith from 'lodash/uniqWith'
import { useFilePicker } from 'react-sage'
import filter from 'lodash/filter'
import capitalize from 'lodash/capitalize'
import { useTheme } from 'styled-components'

import { GqlError } from '../utils/Alert'

import { useRepositoryContext } from '../../contexts/RepositoryContext'
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

type FormState = {
  name: string
  description: string
  category: string
  oauthUrl: string
  oauthMethod: string
  tags: { tag: string }[]
  private: boolean
  websiteUrl?: string
  docsUrl?: string
  githubUrl?: string
  discordUrl?: string
  slackUrl?: string
  twitterUrl?: string
}

const ICON_PICKER_PROPS = {
  minImageWidth: 64,
  maxImageWidth: 512,
  minImageHeight: 64,
  maxImageHeight: 512,
}
const ICON_PICKER_INPUT_OPTS = {
  multiple: false,
  accept: 'image/jpeg,image/png',
}

function RepositoryEdit() {
  const theme = useTheme()
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
    private: privateRepo,
    community: communityUrls,
    documentation,
  } = useRepositoryContext()

  const {
    state: formState,
    initialState: formInitialState,
    hasUpdates: formStateHasUpdates,
    update: updateFormState,
    errors: formStateErrors,
    updateErrors: updateFormStateErrors,
    // reset: resetFormState,
  } = useUpdateState<FormState>(
    useMemo(
      () => ({
        name: name || '',
        description: description || '',
        category: category || '',
        oauthUrl: oauthSettings?.uriFormat || '',
        oauthMethod: `${oauthSettings?.authMethod || authMethods.BASIC}`,
        tags: isArray(tags) ? tags.map((tag) => ({ tag: tag?.tag || '' })) : [],
        private: !!privateRepo,
        websiteUrl: (communityUrls as any)?.homepage || '',
        docsUrl: documentation || '',
        githubUrl: (communityUrls as any)?.gitUrl || '',
        discordUrl: communityUrls?.discord || '',
        slackUrl: communityUrls?.slack || '',
        twitterUrl: communityUrls?.twitter || '',
      }),
      [
        name,
        description,
        oauthSettings?.authMethod,
        oauthSettings?.uriFormat,
        tags,
        privateRepo,
        category,
        communityUrls,
        documentation,
      ]
    )
  )

  const [tagSearchString, setTagSearchString] = useState('')
  const tagSearch = useQuery(TAGS_SEARCH_QUERY, {
    variables: { q: tagSearchString, first: 200 },
  })
  const tagSearchResults = useMemo(() => {
    const results: { tag: string; count: number; new?: boolean }[] =
      tagSearch?.data?.tags?.edges?.map((edge: any) => edge?.node) || []
    let newTag: string | null = tagSearchString
      .replaceAll(/([\s_]+)/gu, '-')
      .replaceAll(/[^A-Za-z-]+/gu, '')
      .toLowerCase()

    if (results.find((res) => res.tag.toLowerCase() === newTag)) {
      newTag = null
    }
    if (newTag) {
      results.push({ tag: newTag, count: 0, new: true })
    }

    return results
  }, [tagSearch, tagSearchString])

  const [lightIconUpdate, setLightIconUpdate] = useState<{
    file: File | null
    previewUrl: string | null
  }>({ file: null, previewUrl: icon || null })
  const [darkIconUpdate, setDarkIconUpdate] = useState<{
    file: File | null
    previewUrl: string | null
  }>({ file: null, previewUrl: darkIcon || null })

  const [mutation, { loading, error }] = useMutation(
    UPDATE_REPOSITORY_MUTATION,
    {
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
          ...(lightIconUpdate.file ? { icon: lightIconUpdate.file } : {}),
          ...(darkIconUpdate.file ? { darkIcon: darkIconUpdate.file } : {}),
          tags: formState.tags,
          private: formState.private,
          documentation: formState.docsUrl,
          community: {
            homepage: formState.websiteUrl,
            gitUrl: formState.githubUrl,
            discord: formState.discordUrl,
            slack: formState.slackUrl,
            twitter: formState.twitterUrl,
          },
        },
      },
      update: (_cache, { data: { updateRepository } }) => {
        setLightIconUpdate({
          previewUrl: updateRepository.icon || null,
          file: null,
        })
        setDarkIconUpdate({
          previewUrl: updateRepository.darkIcon || null,
          file: null,
        })
      },
    }
  )

  const lightIconPicker = useFilePicker(ICON_PICKER_PROPS)
  const darkIconPicker = useFilePicker(ICON_PICKER_PROPS)

  useEffect(() => {
    const cleanups = [
      { iconPicker: lightIconPicker, setIconUpdate: setLightIconUpdate },
      { iconPicker: darkIconPicker, setIconUpdate: setDarkIconUpdate },
    ].map(({ iconPicker, setIconUpdate }) => {
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

      return () => {}
    })

    return () => {
      cleanups.forEach((c) => c?.())
    }
  }, [lightIconPicker, darkIconPicker])

  function handleSubmit(event: React.SyntheticEvent<HTMLElement>) {
    event.preventDefault()
    if (!formState.oauthUrl) {
      updateFormState({ oauthMethod: authMethods.BASIC })
    }
    mutation()
  }

  function handleDeleteTag(delTag: FormState['tags'][number]) {
    updateFormState({
      tags: filter(formState.tags, (tag0) => delTag.tag !== tag0.tag),
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

  function renderUrlField(key: string, label: string, placeholder: string) {
    return (
      <FormField
        label={label}
        error={formStateErrors[key]}
        hint={formStateErrors[key] ? 'Must be a valid URL' : ''}
        css={{
          flexGrow: 1,
        }}
      >
        <Input
          value={formState[key]}
          error={formStateErrors[key]}
          onChange={(event) => {
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
    return (
      <h2 css={{ margin: 0, ...theme.partials.text.title1 }}>
        You cannot edit this repository
      </h2>
    )
  }

  const formHasUpdates =
    formStateHasUpdates ||
    icon !== lightIconUpdate.previewUrl ||
    darkIcon !== darkIconUpdate.previewUrl
  const submitEnabled = formHasUpdates
  const desktopMq = `@media (min-width: ${theme.breakpoints.desktop}px)`

  return (
    <form
      onSubmit={handleSubmit}
      css={{
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PageTitle heading="Edit">
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.medium,
          }}
        >
          <SaveButton
            type="submit"
            dirty={formHasUpdates}
            enabled={submitEnabled}
            disabled={
              !submitEnabled ||
              Object.keys(formStateErrors).some((key) => formStateErrors[key])
            }
            loading={loading}
          />
          <div
            css={{
              [desktopMq]: {
                display: 'none',
              },
            }}
          >
            <RepositoryActions />
          </div>
        </div>
      </PageTitle>
      <ContentCard
        marginBottom="xlarge"
        overflow="auto"
      >
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.large,
            maxWidth: 608,
            width: '100%',
          }}
        >
          {error && (
            <GqlError
              error={error}
              header="Something went wrong"
            />
          )}
          <div
            css={{
              display: 'grid',
              gridAutoFlow: 'column',
              gridAutoColumns: '1fr',
              gap: theme.spacing.medium,
            }}
          >
            {lightIconPicker.HiddenFileInput(ICON_PICKER_INPUT_OPTS)}
            <FormField label="Default icon (or light mode)">
              <IconPicker
                {...{
                  theme,
                  iconUpdate: lightIconUpdate,
                  iconPicker: lightIconPicker,
                  setIconUpdate: setLightIconUpdate,
                  mode: 'light',
                }}
              />
            </FormField>
            {darkIconPicker.HiddenFileInput(ICON_PICKER_INPUT_OPTS)}
            <FormField label="Dark mode icon">
              <IconPicker
                {...{
                  theme,
                  iconUpdate: darkIconUpdate,
                  iconPicker: darkIconPicker,
                  setIconUpdate: setDarkIconUpdate,
                  mode: 'dark',
                }}
              />
            </FormField>
          </div>
          <div
            css={{
              display: 'flex',
              gap: theme.spacing.medium,
            }}
          >
            <FormField
              label="Name"
              css={{ flexGrow: 1 }}
            >
              <Input
                placeholder={formInitialState.name}
                value={formState.name}
                onChange={(event) =>
                  updateFormState({ name: event.target.value })
                }
              />
            </FormField>
            <FormField
              label="Category"
              css={{
                flexShrink: 1,
                width: 160,
              }}
            >
              <Select
                label={capitalize(formState.category)}
                selectedKey={formState.category}
                onSelectionChange={(key) => {
                  updateFormState({ category: key as string })
                }}
              >
                {categories.map((category) => (
                  <ListBoxItem
                    key={category}
                    label={capitalize(category.toLocaleLowerCase())}
                    textValue={capitalize(category.toLocaleLowerCase())}
                  />
                ))}
              </Select>
            </FormField>
          </div>
          <FormField
            label="Description"
            length={formState.description.length}
            maxLength={200}
            css={{
              width: '100%',
            }}
          >
            <Input
              multiline
              minRows={3}
              placeholder={formInitialState.description}
              value={formState.description}
              onChange={(event) =>
                updateFormState({
                  description: event.target.value.substring(0, 200),
                })
              }
            />
          </FormField>
          <div
            css={{
              display: 'flex',
              gap: theme.spacing.medium,
            }}
          >
            {renderUrlField('websiteUrl', 'Website link', 'Website URL')}
            {renderUrlField('docsUrl', 'Docs link', 'Docs URL')}
          </div>
          <div
            css={{
              display: 'flex',
              gap: theme.spacing.medium,
            }}
          >
            {renderUrlField('githubUrl', 'GitHub link', 'GitHub URL')}
            {renderUrlField('discordUrl', 'Discord link', 'Discord invite URL')}
          </div>
          <div
            css={{
              display: 'flex',
              gap: theme.spacing.medium,
            }}
          >
            {renderUrlField('slackUrl', 'Slack link', 'Slack invite URL')}
            {renderUrlField('twitterUrl', 'Twitter link', 'Twitter URL')}
          </div>
          <FormField label="Tags">
            <ComboBox
              inputProps={{ placeholder: 'Search for tags' }}
              onInputChange={(inputVal) => {
                setTagSearchString(inputVal)
              }}
              onSelectionChange={(val) => {
                handleCreateTag(val as string)
              }}
            >
              {tagSearchResults.map((result) =>
                result.new ? (
                  <ListBoxFooterPlus
                    key={result.tag}
                    textValue={result.tag}
                  >
                    New tag: {result.tag}
                  </ListBoxFooterPlus>
                ) : (
                  <ListBoxItem
                    key={result.tag}
                    label={result.tag}
                    textValue={result.tag}
                  />
                )
              )}
            </ComboBox>
            <div
              css={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                gap: theme.spacing.xsmall,
                marginTop: theme.spacing.small,
              }}
            >
              {formState.tags.map((tag) => (
                <Chip
                  key={tag.tag}
                  onClick={() => handleDeleteTag(tag)}
                  clickable
                  closeButton
                  size="small"
                >
                  {tag.tag}
                </Chip>
              ))}
            </div>
          </FormField>

          <div
            css={{
              display: 'flex',
              alignItems: 'stretch',
              alignContent: 'stretch',
              flexWrap: 'nowrap',
            }}
          >
            <FormField
              label="OAuth settings"
              hint="This must be a valid url beginning with https://"
              css={{
                width: '100%',
              }}
            >
              <Input
                value={formState.oauthUrl}
                onChange={(event) =>
                  updateFormState({ oauthUrl: event.target.value })
                }
                placeholder={
                  formInitialState.oauthUrl || 'https://{domain}/oauth/callback'
                }
              />
            </FormField>
            <FormField
              label="HTTP method"
              css={{
                width: 148,
                flexShrink: 1,
                marginLeft: theme.spacing.medium,
                marginBottom: theme.spacing.large,
              }}
            >
              <Select
                selectedKey={formState.oauthMethod}
                label={capitalize(formState.oauthMethod)}
                onSelectionChange={(key) =>
                  updateFormState({ oauthMethod: key as string })
                }
              >
                {Object.keys(authMethods).map((method) => (
                  <ListBoxItem
                    key={method}
                    label={capitalize(method.toLocaleLowerCase())}
                    textValue={capitalize(method.toLocaleLowerCase())}
                  />
                ))}
              </Select>
            </FormField>
          </div>
          <Switch
            checked={formState.private || false}
            onChange={(checked) => {
              updateFormState({ private: checked })
            }}
            css={{
              paddingTop: theme.spacing.xsmall,
              paddingBottom: theme.spacing.xsmall,
            }}
          >
            Private repository
          </Switch>
        </div>
      </ContentCard>
    </form>
  )
}

export default RepositoryEdit
function IconPicker({
  iconUpdate,
  iconPicker,
  setIconUpdate,
  mode,
}: {
  iconUpdate: { file: File | null; previewUrl: string | null }
  iconPicker
  setIconUpdate: React.Dispatch<
    React.SetStateAction<{ file: File | null; previewUrl: string | null }>
  >
  mode: 'dark' | 'light'
}) {
  const theme = useTheme()

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.medium,
      }}
    >
      <IconUploadPreview
        src={iconUpdate.previewUrl}
        onClick={iconPicker.onClick}
        mode={mode}
      />
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xsmall,
        }}
      >
        <Button
          type="button"
          secondary
          small
          onClick={iconPicker.onClick}
          css={{
            minHeight: 'auto',
          }}
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
      </div>
    </div>
  )
}
