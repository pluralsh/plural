import { useState } from 'react'
import { Box, Stack, Text } from 'grommet'
import { FileIcon, defaultStyles } from 'react-file-icon'
import { HoveredBackground, Tooltip } from 'forge-core'
import moment from 'moment'
import { filesize } from 'filesize'
import { DownloadIcon } from '@pluralsh/design-system'

import { download } from '../../utils/file'

import { FileTypes } from './types'

const extension = file => file.split('.').pop()

function DownloadAffordance({ blob }: any) {
  return (
    <Tooltip align={{ bottom: 'top' }}>
      <HoveredBackground>
        <Box
          // @ts-expect-error
          accentable
          margin={{ right: 'xsmall', top: 'xsmall' }}
          focusIndicator={false}
          background="#fff"
          round="xsmall"
          pad="small"
          animation={{ type: 'fadeIn', duration: 200 }}
          onClick={e => {
            e.preventDefault()
            download(blob)
          }}
          border={{ color: 'border' }}
        >
          <DownloadIcon size={15} />
        </Box>
      </HoveredBackground>
      <Text size="small">download</Text>
    </Tooltip>
  )
}

function Image({ height, blob, filename }: any) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Stack anchor="top-right">
        <img
          style={{
            height: !height || height === 0 ? 50 : height,
            maxHeight: 300,
          // objectFit: 'contain'
          }}
          src={blob}
          alt={filename}
        />
        {hover && (<DownloadAffordance blob={blob} />)}
      </Stack>
    </Box>
  )
}

function Video({ blob, filename }: any) {
  return (
    <video
      controls
      style={{ height: 300 }}
      src={blob}
      // @ts-expect-error
      alt={filename}
    />
  )
}

function MediaFile({ file }: any) {
  const { filename, mediaType } = file

  return (
    <Box gap="xsmall">
      <Box
        // @ts-expect-error
        focusindicator={false}
        direction="row"
        align="center"
        gap="xsmall"
      >
        <Text
          size="xsmall"
          color="dark-6"
        >
          {filename}
        </Text>
      </Box>
      <Box
        direction="row"
        align="start"
      >
        {mediaType === FileTypes.IMAGE
          ? <Image {...file} />
          : <Video {...file} />}
      </Box>
    </Box>
  )
}

export function Icon({ size, name }: any) {
  const ext = extension(name)
  const styles = defaultStyles[ext] || {}

  return (
    <Box width={`${size}px`}>
      <FileIcon
        extension={ext}
        {...styles}
      />
    </Box>
  )
}

const MEDIA_STYLES = { maxWidth: 50, maxHeight: 50 }

export function FileEntry({ file }: any) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      flex={false}
      focusIndicator={false}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Stack anchor="top-right">
        <Box
          direction="row"
          height="80px"
          align="center"
          gap="small"
          background={hover ? 'light-2' : undefined}
          border={{ side: 'bottom', color: 'light-4' }}
          pad={{ left: 'small' }}
        >
          <Box
            width="60px"
            height="60px"
            align="center"
            justify="center"
          >
            {file.mediaType === FileTypes.VIDEO ? (
              <video
                src={file.blob}
                style={MEDIA_STYLES}
                // @ts-expect-error
                alt={file.filename}
              />
            )
              : file.mediaType === FileTypes.IMAGE ? (
                <img
                  src={file.blob}
                  style={MEDIA_STYLES}
                  alt={file.filename}
                />
              ) : (
                <Icon
                  name={file.filename}
                  size={40}
                />
              )}
          </Box>
          <Box width="100%">
            <Text size="small">{file.filename}</Text>
            <Box
              direction="row"
              gap="small"
            >
              <Text
                size="xsmall"
                color="dark-5"
              >{filesize(file.filesize || 0)?.toString()}
              </Text>
              <Text size="xsmall">{moment(file.insertedAt).fromNow()}</Text>
            </Box>
          </Box>
        </Box>
        {hover && (<DownloadAffordance object={file.object} />)}
      </Stack>
    </Box>
  )
}

export function StandardFile({
  file: {
    filename, blob, insertedAt, ...file
  },
}: any) {
  const [hover, setHover] = useState(false)

  return (
    <Box fill="horizontal">
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => download(blob)}
        border={hover ? { color: 'focus' } : { color: 'border' }}
        background="#fff"
        round="xsmall"
        align="center"
        direction="row"
        pad="small"
        gap="small"
        margin={{ vertical: 'xsmall' }}
        width="30%"
      >
        <Icon
          name={filename}
          size={40}
        />
        <Box flex={false}>
          <Text size="small">{filename}</Text>
          <Box
            direction="row"
            gap="small"
            align="center"
          >
            <Text
              size="xsmall"
              color="dark-5"
            >{filesize(file.filesize || 0)?.toString()}
            </Text>
            <Text size="xsmall">{moment(insertedAt).fromNow()}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function File({ file }: any) {
  switch (file.mediaType) {
  case FileTypes.IMAGE:
  case FileTypes.VIDEO:
    return <MediaFile file={file} />
  default:
    return <StandardFile file={file} />
  }
}
