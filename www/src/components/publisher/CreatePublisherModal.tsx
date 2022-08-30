import { useEffect, useState } from 'react'
import { Button, Flex, Modal } from 'honorable'
import {
  FormField, Input, ModalActions, ModalHeader,
} from 'pluralsh-design-system'
import { useFilePicker } from 'react-sage'
import isArray from 'lodash/isArray'

import { generatePreview } from '../../utils/file'

import IconUploadPreview from '../utils/IconUploadPreview'

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
    const file = isArray(iconPicker?.files) && iconPicker?.files[0]

    if (!file) return

    const reader = generatePreview(file, (file: IconUploadType) => {
      setIconUpload(file)
    })

    return () => {
      reader.abort()
    }
  }, [iconPicker.files])

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
      <Flex
        marginBottom="large"
        gap="medium"
      >
        <FormField
          label="Website"
          flexGrow={1}
        >
          <Input
            value={website}
            onChange={event => setWebsite(event.target.value)}
            placeholder="Website URL"
          />
        </FormField>
        <FormField
          label="Docs link"
          flexGrow={1}
        >
          <Input
            value={documentation}
            onChange={event => setDocumentation(event.target.value)}
            placeholder="Docs URL"
          />
        </FormField>
      </Flex>
      <Flex
        marginBottom="large"
        gap="medium"
      >
        <FormField
          label="GitHub link"
          flexGrow={1}
        >
          <Input
            value={github}
            onChange={event => setGithub(event.target.value)}
            placeholder="GitHub URL"
          />
        </FormField>
        <FormField
          label="Discord link"
          flexGrow={1}
        >
          <Input
            value={discord}
            onChange={event => setDiscord(event.target.value)}
            placeholder="Discord invite URL"
          />
        </FormField>
      </Flex>
      <Flex
        marginBottom="large"
        gap="medium"
      >
        <FormField
          label="Slack Link"
          flexGrow={1}
        >
          <Input
            value={slack}
            onChange={event => setSlack(event.target.value)}
            placeholder="Slack invite URL"
          />
        </FormField>
        <FormField
          label="Twitter link"
          flexGrow={1}
        >
          <Input
            value={twitter}
            onChange={event => setTwitter(event.target.value)}
            placeholder="Twitter URL"
          />
        </FormField>
      </Flex>
      <ModalActions gap="medium">
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button primary>
          Save
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default CreatePublisherModal
