import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Modal } from 'honorable'
import {
  Alert,
  FormField,
  Input,
  ModalActions,
  ModalHeader,
} from 'pluralsh-design-system'
import { useMutation } from '@apollo/client'
import { useFilePicker } from 'react-sage'
import isArray from 'lodash/isArray'

import { generatePreview } from '../../utils/file'

import IconUploadPreview from '../utils/IconUploadPreview'

import { CREATE_PUBLISHER_MUTATION } from './queries'

type CreatePublisherModalProps = {
  open: boolean
  onClose: () => void
}

type IconUploadType = {
  file: File | null;
  previewUrl: string | null;
}

function CreatePublisherModal({ open, onClose }: CreatePublisherModalProps) {
  const [iconUpload, setIconUpload] = useState<IconUploadType>({ file: null, previewUrl: null })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [documentation, setDocumentation] = useState('')
  const [github, setGithub] = useState('')
  const [discord, setDiscord] = useState('')
  const [slack, setSlack] = useState('')
  const [twitter, setTwitter] = useState('')
  const [preMutationError, setPreMutationError] = useState('')
  const [errors, setErrors] = useState({
    website: false,
    documentation: false,
    github: false,
    discord: false,
    slack: false,
    twitter: false,
  })
  const navigate = useNavigate()

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

  const [mutation, { data, loading, error }] = useMutation(CREATE_PUBLISHER_MUTATION, {
    variables: {
      attributes: {
        name,
        description,
        ...(iconUpload.file ? { avatar: iconUpload.file } : {}),
      },
    },
  })

  useEffect(() => {
    const file = isArray(iconPicker?.files) && iconPicker?.files[0]

    if (!file) return

    const reader = generatePreview(file, (file: IconUploadType) => {
      setIconUpload(file)
    })

    return () => {
      reader.abort()
    }
  }, [iconPicker.files])

  useEffect(() => {
    if (!data) return

    navigate(`/publisher/${data.createPublisher.id}`)
    onClose()
  }, [data, navigate, onClose])

  useEffect(() => {
    if (!error) return

    setPreMutationError(error.message)
  }, [error])

  function handleSubmit() {
    setPreMutationError('')

    if (!name) {
      setPreMutationError('Name is required')

      return
    }

    if (!description) {
      setPreMutationError('Description is required')

      return
    }

    mutation()
      .catch(error => {
        setPreMutationError(error.message)
      })
  }

  function isValidUrl(url: string) {
    return !/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url)
  }

  function renderUrlField(
    label: string,
    placeholder: string,
    getter: string,
    setter: (value: string) => void,
    error: boolean,
  ) {
    return (
      <FormField
        label={label}
        flexGrow={1}
        error={error}
        hint={error ? 'Must be a valid URL' : ''}
        marginBottom="large"
      >
        <Input
          value={getter}
          error={error}
          onChange={event => {
            setter(event.target.value)
            setErrors(e => ({
              ...e,
              website: isValidUrl(event.target.value),
            }))
          }}
          placeholder={placeholder}
        />
      </FormField>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={608}
    >
      <ModalHeader>
        Create a publisher
      </ModalHeader>
      {iconPicker.HiddenFileInput(iconPickerInputOpts)}
      <FormField
        label="Icon"
        marginBottom="large"
      >
        <Flex
          direction="row"
          alignItems="flex-end"
          gap="medium"
        >
          <IconUploadPreview
            src={iconUpload.previewUrl}
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
              {iconUpload.previewUrl ? 'Switch' : 'Upload'}
            </Button>
            {iconUpload.previewUrl && (
              <Button
                type="button"
                secondary
                small
                minHeight="auto"
                destructive
                onClick={() => {
                  setIconUpload({ file: null, previewUrl: null })
                }}
              >
                Delete
              </Button>
            )}
          </Flex>
        </Flex>
      </FormField>
      <FormField
        label="Name"
        marginBottom="large"
      >
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Enter a name"
        />
      </FormField>
      <FormField
        label="Description"
        marginBottom="large"
        length={description.length}
        maxLength={200}
      >
        <Input
          multiline
          minRows={3}
          value={description}
          onChange={event => setDescription(event.target.value.substring(0, 200))}
          placeholder="Enter a description"
        />
      </FormField>
      <Flex gap="medium">
        {renderUrlField(
          'Website link', 'Website URL', website, setWebsite, errors.website
        )}
        {renderUrlField(
          'Docs link', 'Docs URL', documentation, setDocumentation, errors.documentation
        )}
      </Flex>
      <Flex gap="medium">
        {renderUrlField(
          'GitHub link', 'GitHub URL', github, setGithub, errors.github
        )}
        {renderUrlField(
          'Docs link', 'Discord invite URL', discord, setDiscord, errors.discord
        )}
      </Flex>
      <Flex gap="medium">
        {renderUrlField(
          'Slack link', 'Slack invite URL', slack, setSlack, errors.slack
        )}
        {renderUrlField(
          'Twitter link', 'Twitter URL', twitter, setTwitter, errors.twitter
        )}
      </Flex>
      {!!preMutationError && (
        <Alert severity="error">
          {preMutationError}
        </Alert>
      )}
      <ModalActions gap="medium">
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          primary
          loading={loading}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default CreatePublisherModal
