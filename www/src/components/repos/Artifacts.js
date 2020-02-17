import React, { useState, useRef } from 'react'
import { Box, Text, Anchor, Drop, Markdown } from 'grommet'
import { Terminal, Apple, Windows, Ubuntu } from 'grommet-icons'
import { chunk } from '../../utils/array'
import size from 'filesize'
import { download } from '../../utils/file'
import { Container } from './Integrations'
import { MARKDOWN_STYLING } from './Chart'

const ICON_SIZE = '30px'
const SMALL_ICON_SIZE = '13px'
const SHA_LENGTH = 8

function trim(sha) {
  if (sha.length > SHA_LENGTH) return `${sha.substring(0, SHA_LENGTH)}...`
  return sha
}

function ArtifactPlatform({platform}) {
  switch (platform) {
    case "MAC":
      return <Apple size={SMALL_ICON_SIZE} />
    case "WINDOWS":
      return <Windows size={SMALL_ICON_SIZE} />
    case "LINUX":
      return <Ubuntu size={SMALL_ICON_SIZE} />
    default:
      return null
  }
}

function ArtifactIcon({type}) {
  switch (type) {
    case "CLI":
      return <Terminal size={ICON_SIZE} />
    default:
      return null
  }
}

function Readme({readme, dropRef, setOpen}) {
  // if (!readme || readme === "") return null

  return (
    <Drop
      target={dropRef.current}
      align={{bottom: 'top', right: 'left'}}
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}>
      <Box pad={{horizontal: 'small', bottom: 'small'}} style={{maxWidth: '40vw', overflow: 'auto'}}>
        <Markdown components={MARKDOWN_STYLING}>
          {readme}
        </Markdown>
      </Box>
    </Drop>
  )
}

export function Artifact({name, type, blob, sha, readme, platform, filesize}) {
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const dropRef = useRef()
  return (
    <>
    <Container
      onClick={() => setOpen(!open)}
      hover={hover}
      setHover={setHover}
      style={{cursor: 'pointer'}}
      round='xsmall'
      direction='row'
      width='50%'
      gap='medium'
      align='center'
      pad='small'>
      <ArtifactIcon type={type} />
      <Box ref={dropRef} gap='xsmall'>
        <Box direction='row' gap='xsmall' align='center'>
          <Anchor size='small' weight='bold' onClick={() => download(blob)}>{name}</Anchor>
          <ArtifactPlatform platform={platform} />
        </Box>
        <Box>
          <Text size='small' color='dark-6'>sha: {trim(sha)}</Text>
          <Text size='small' color='dark-6'>size: {size(filesize)}</Text>
        </Box>
      </Box>
    </Container>
    {open && <Readme dropRef={dropRef} readme={readme} setOpen={setOpen} />}
    </>
  )
}

export default function Artifacts({artifacts}) {
  if (!artifacts || artifacts.length === 0) return null

  return (
    <Box elevation='small'>
      <Box gap='small' pad='small'>
        <Text style={{fontWeight: 500}} size='small'>Artifacts</Text>
        {Array.from(chunk(artifacts, 2)).map((chunk, i) => (
          <Box key={i} direction='row' gap='small'>
            {artifacts.map((artifact) => <Artifact key={artifact.id} {...artifact} />)}
          </Box>
        ))}
      </Box>
    </Box>
  )
}