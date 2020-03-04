import React, { useState, useRef } from 'react'
import { Box, Text, Anchor, Drop, Markdown, Table, TableBody, TableRow, TableCell } from 'grommet'
import { Apple, Windows, Ubuntu, Terminal, Previous, Cube } from 'grommet-icons'
import { download } from '../../utils/file'
import { MARKDOWN_STYLING } from './Chart'
import fs from 'filesize'

const ICON_SIZE = '20px'
const SMALL_ICON_SIZE = '13px'
const SHA_LENGTH  = 20

const trim = (sha) => `${sha.substring(0, SHA_LENGTH)}...`

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

const ICON_COLOR = 'focus'

function ArtifactIcon({type}) {
  switch (type) {
    case "CLI":
      return <Terminal color={ICON_COLOR} size={ICON_SIZE} />
    default:
      return <Cube color={ICON_COLOR} size={ICON_SIZE} />
  }
}

function Readme({readme}) {
  return (
    <Box pad={{horizontal: 'small', bottom: 'small'}} style={{maxWidth: '40vw', overflow: 'auto'}}>
      <Markdown components={MARKDOWN_STYLING}>
        {readme}
      </Markdown>
    </Box>
  )
}

function ArtifactOption({onClick, text, border, round}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseLeave={() => setHover(false)}
      onMouseEnter={() => setHover(true)}
      onClick={onClick}
      background={hover ? '#000000' : null}
      round={round}
      pad='xsmall'
      border={border}>
      <Text size='small' color={hover ? 'light-3' : null}>{text}</Text>
    </Box>
  )
}

function WithBack({children, setAlternate}) {
  const [hover, setHover] = useState(false)
  return (
    <Box animation='fadeIn'>
      <Box pad='small'>
        {children}
      </Box>
      <Box
        style={{cursor: 'pointer'}}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        background={hover ? 'light-3' : null}
        onClick={() => setAlternate(null)}
        direction='row'
        align='center'
        border='top'
        pad='small'
        gap='small'>
        <Previous size='12px' />
        <Text size='small'>back</Text>
      </Box>
    </Box>
  )
}


function ArtifactDetails({sha, filesize}) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell border='right'><b>sha</b></TableCell>
          <TableCell>{trim(sha)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell border='right'><b>filesize</b></TableCell>
          <TableCell>{fs(filesize)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function ArtifactDetail({dropRef, setOpen, blob, readme, sha, filesize}) {
  const [alternate, setAlternate] = useState(null)
  return (
    <Drop
      target={dropRef.current}
      align={{bottom: 'top'}}
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}>
      {alternate ? <WithBack setAlternate={setAlternate}>{alternate}</WithBack> : (
        <Box background='#222222' direction='row' round='xsmall'>
          <ArtifactOption
            text='download'
            border='right'
            round={{corner: 'left', size: 'xsmall'}}
            onClick={() => download(blob)} />
          <ArtifactOption
            text='readme'
            border='right'
            onClick={() => setAlternate(<Readme readme={readme} />)} />
          <ArtifactOption
            text='details'
            border='right'
            round={{corner: 'right', size: 'xsmall'}}
            onClick={() => setAlternate(<ArtifactDetails sha={sha} filesize={filesize} />)} />
        </Box>
      )}
    </Drop>
  )
}

export function Artifact({name, type, platform, ...artifact}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const dropRef = useRef()
  return (
    <>
    <Box
      onClick={() => setOpen(!open)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      background={hover ? 'light-3' : null}
      border='bottom'
      direction='row'
      gap='small'
      align='center'
      pad='small'>
      <ArtifactIcon type={type} />
      <Box ref={dropRef} gap='xsmall'>
        <Box direction='row' gap='xsmall' align='center'>
          <Anchor size='small' weight='bold' onClick={() => setOpen(true)}>{name}</Anchor>
          <ArtifactPlatform platform={platform} />
        </Box>
      </Box>
    </Box>
    {open && <ArtifactDetail dropRef={dropRef} setOpen={setOpen} {...artifact} />}
    </>
  )
}

export default function Artifacts({artifacts}) {
  if (!artifacts || artifacts.length === 0) return null

  return (
    <Box elevation='small'>
      <Box>
        <Box border='bottom' pad='small'>
          <Text style={{fontWeight: 500}} size='small'>Artifacts</Text>
        </Box>
        {artifacts.map((artifact) => <Artifact key={artifact.id} {...artifact} />)}
      </Box>
    </Box>
  )
}