import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Modal } from 'honorable'
import { FormField, Input } from 'pluralsh-design-system'
import { useMutation } from '@apollo/client'
import { useFilePicker } from 'react-sage'
import isArray from 'lodash/isArray'

import { isValidUrl } from '../../utils/string'
import { generatePreview } from '../../utils/file'

import IconUploadPreview from '../utils/IconUploadPreview'
import { Alert, AlertStatus } from '../utils/Alert'

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

  const [mutation, { loading }] = useMutation(CREATE_PUBLISHER_MUTATION, {
    variables: {
      attributes: {
        name,
        description,
        ...(iconUpload.file ? { avatar: iconUpload.file } : {}),
      },
    },
    onCompleted: data => {
      if (!data) return

      navigate(`/publisher/${data.createPublisher.id}`)
      onClose()
    },
    onError: error => {
      setPreMutationError(error.message)
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

  function renderUrlField(
    label: string,
    placeholder: string,
    getter: string,
    setter: (value: string) => void,
    error: boolean,
    setError: (value: boolean) => void,
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
            setError(isValidUrl(event.target.value))
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
      size="large"
      header="Create a publisher"
      actions={(
        <>
          <Button
            secondary
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            primary
            marginLeft="medium"
            loading={loading}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </>
      )}
    >
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
          'Website link', 'Website URL', website, setWebsite, errors.website, value => setErrors({ ...errors, website: value }),
        )}
        {renderUrlField(
          'Docs link', 'Docs URL', documentation, setDocumentation, errors.documentation, value => setErrors({ ...errors, documentation: value }),
        )}
      </Flex>
      <Flex gap="medium">
        {renderUrlField(
          'GitHub link', 'GitHub URL', github, setGithub, errors.github, value => setErrors({ ...errors, github: value }),
        )}
        {renderUrlField(
          'Docs link', 'Discord invite URL', discord, setDiscord, errors.discord, value => setErrors({ ...errors, discord: value }),
        )}
      </Flex>
      <Flex gap="medium">
        {renderUrlField(
          'Slack link', 'Slack invite URL', slack, setSlack, errors.slack, value => setErrors({ ...errors, slack: value }),
        )}
        {renderUrlField(
          'Twitter link', 'Twitter URL', twitter, setTwitter, errors.twitter, value => setErrors({ ...errors, twitter: value }),
        )}
      </Flex>
      {!!preMutationError && (
        <Alert
          status={AlertStatus.ERROR}
          hearder="Error"
          description={preMutationError}
        />
      )}
    </Modal>
  )
}

export default CreatePublisherModal
