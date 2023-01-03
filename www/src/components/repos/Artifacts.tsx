import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import {
  Box,
  Collapsible,
  Drop,
  Markdown,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
} from 'grommet'
import {
  AppleLogoIcon,
  CaretLeftIcon,
  DownloadIcon,
  FileIcon,
  ListIcon,
  UbuntuLogoIcon,
  WindowsLogoIcon,
} from '@pluralsh/design-system'
import { Copyable } from 'forge-core'
import { normalizeColor } from 'grommet/utils'
import { filesize as fs } from 'filesize'
import moment from 'moment'

import { HeaderItem } from '../utils/Header'
import { Icon } from '../utils/IconOld'
import { download } from '../../utils/file'

import { DetailContainer } from './Installation'

const SMALL_ICON_SIZE = 13

function ArtifactPlatform({ platform }: any) {
  switch (platform) {
  case 'MAC':
    return (
      <AppleLogoIcon
        size={SMALL_ICON_SIZE}
        fullColor
      />
    )
  case 'WINDOWS':
    return (
      <WindowsLogoIcon
        size={SMALL_ICON_SIZE}
        fullColor
      />
    )
  case 'LINUX':
    return (
      <UbuntuLogoIcon
        size={SMALL_ICON_SIZE}
        fullColor
      />
    )
  default:
    return null
  }
}

function Readme({ readme }: any) {
  return (
    <Box
      pad={{ horizontal: 'small', bottom: 'small' }}
      style={{ overflow: 'auto' }}
    >
      <Markdown>
        {readme}
      </Markdown>
    </Box>
  )
}

const hovered = styled.div`
  cursor: pointer;
  &:hover {
    background-color: ${props => normalizeColor('light-3', props.theme)};
  }
`

const optionHover = styled.div`
  cursor: pointer;
  &:hover {
    background-color: #000000;
  }
  &:hover span {
    text-color: ${props => normalizeColor('light-3', props.theme)};
  }
`

function ArtifactOption({
  onClick, text, border, round,
}: any) {
  return (
    <Box
      as={optionHover}
      onClick={onClick}
      round={round}
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      border={border}
    >
      <Text size="small">{text}</Text>
    </Box>
  )
}

function WithBack({ children, setAlternate }: any) {
  return (
    <Box animation="fadeIn">
      <Box pad="small">
        {children}
      </Box>
      <Box
        as={hovered}
        flex={false}
        onClick={() => setAlternate(null)}
        direction="row"
        align="center"
        border="top"
        pad="small"
        gap="small"
      >
        <CaretLeftIcon size={12} />
        <Text size="small">back</Text>
      </Box>
    </Box>
  )
}

function ArtifactDetails({
  sha, filesize, arch, platform,
}: any) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell border="right"><b>sha256</b></TableCell>
          <TableCell>
            <Copyable
              text={sha}
              pillText="Copied sha256 checksum"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell border="right"><b>filesize</b></TableCell>
          <TableCell>{fs(filesize)?.toString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell border="right"><b>arch</b></TableCell>
          <TableCell>{arch}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell border="right"><b>platform</b></TableCell>
          <TableCell>{platform.toLowerCase()}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function ArtifactDetail({
  dropRef, setOpen, blob, readme, sha, filesize,
}: any) {
  const [alternate, setAlternate] = useState<any>(null)

  return (
    <Drop
      target={dropRef.current}
      align={{ bottom: 'top' }}
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}
    >
      {alternate ? <WithBack setAlternate={setAlternate}>{alternate}</WithBack> : (
        <Box
          background="#222222"
          direction="row"
          round="xsmall"
        >
          <ArtifactOption
            text="download"
            border="right"
            round={{ corner: 'left', size: 'xsmall' }}
            onClick={() => download(blob)}
          />
          <ArtifactOption
            text="readme"
            border="right"
            onClick={() => setAlternate(<Readme readme={readme} />)}
          />
          <ArtifactOption
            text="details"
            border="right"
            round={{ corner: 'right', size: 'xsmall' }}
            onClick={() => setAlternate(<ArtifactDetails
              sha={sha}
              filesize={filesize}
            />)}
          />
        </Box>
      )}
    </Drop>
  )
}

export function Artifact({
                             // eslint-disable-next-line
                             name, type, platform, filesize, ...artifact
}: any) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Box
        focusIndicator={false}
        onClick={() => setOpen(!open)}
        hoverIndicator="light-3"
        direction="row"
        gap="small"
        align="center"
        pad="small"
      >
        <Box
          ref={dropRef}
          gap="xsmall"
        >
          <Box
            direction="row"
            gap="xsmall"
            align="center"
          >
            <Text
              size="small"
              weight={500}
            >{name}
            </Text>
            <ArtifactPlatform platform={platform} />
            <Text
              size="small"
              color="dark-3"
            >-- {fs(filesize)?.toString()}
            </Text>
          </Box>
        </Box>
      </Box>
      {open && (
        <ArtifactDetail
          dropRef={dropRef}
          setOpen={setOpen}
          filesize={filesize}
          {...artifact}
        />
      )}
    </>
  )
}

export function DetailHeader({ text, modifier }: any) {
  return (
    <Box
      direction="row"
      border={{ color: 'border', side: 'bottom' }}
      pad="small"
      background="light-1"
      justify="end"
    >
      <Box fill="horizontal">
        <Text
          weight={500}
          size="small"
        >{text}
        </Text>
      </Box>
      {modifier}
    </Box>
  )
}

const ROW_HEIGHT = '50px'

function ArtifactRow({ artifact }: any) {
  const [open, setOpen] = useState<any>(null)
  const doSetOpen = useCallback(tab => (open === tab ? setOpen(null) : setOpen(tab)), [setOpen, open])

  return (
    <>
      <Box
        flex={false}
        height={ROW_HEIGHT}
        direction="row"
        gap="small"
        align="center"
        pad={{ horizontal: 'small' }}
        border={{ side: 'bottom', color: 'border' }}
      >
        <Box
          width="20%"
          direction="row"
          gap="small"
          align="center"
        >
          <Text
            size="small"
            weigth={500}
          >
            {artifact.name}
          </Text>
        </Box>
        <Box
          width="20%"
          direction="row"
          gap="small"
          align="center"
        >
          <ArtifactPlatform platform={artifact.platform} />
          <Text
            size="small"
            color="dark-3"
          >({artifact.arch})
          </Text>
        </Box>
        <HeaderItem
          text={fs(artifact.filesize)}
          width="20%"
          nobold
        />
        <HeaderItem
          text={moment(artifact.updatedAt || artifact.insertedAt).format('lll')}
          width="20%"
          nobold
        />
        <Box
          width="20%"
          direction="row"
          align="center"
          gap="small"
        >
          <Icon
            icon={FileIcon}
            tooltip="readme"
            onClick={() => doSetOpen('readme')}
          />
          <Icon
            icon={ListIcon}
            tooltip="details"
            onClick={() => doSetOpen('details')}
          />
          <Icon
            icon={DownloadIcon}
            tooltip="download"
            onClick={() => download(artifact.blob)}
          />
        </Box>
      </Box>
      <Collapsible
        open={!!open}
        direction="vertical"
      >
        <Box
          fill="horizontal"
          pad="small"
        >
          {open === 'readme' && <Readme readme={artifact.readme} />}
          {open === 'details' && <ArtifactDetails {...artifact} />}
        </Box>
      </Collapsible>
    </>
  )
}

function ArtifactHeader() {
  return (
    <Box
      flex={false}
      height={ROW_HEIGHT}
      direction="row"
      gap="small"
      align="center"
      pad={{ horizontal: 'small' }}
      border={{ side: 'bottom', color: 'border' }}
    >
      <HeaderItem
        text="Name"
        width="20%"
      />
      <HeaderItem
        text="Platform"
        width="20%"
      />
      <HeaderItem
        text="Filesize"
        width="20%"
      />
      <HeaderItem
        text="Created"
        width="20%"
      />
      <Box width="20%" />
    </Box>
  )
}

export function ArtifactTable({ artifacts }: any) {
  return (
    <Box
      fill
      style={{ overflow: 'auto' }}
    >
      <ArtifactHeader />
      <Box flex={false}>
        {artifacts.map(art => (
          <ArtifactRow
            key={art.id}
            artifact={art}
          />
        ))}
      </Box>
    </Box>
  )
}

export default function Artifacts({ artifacts }: any) {
  if (!artifacts || artifacts.length === 0) return null

  return (
    <DetailContainer>
      <DetailHeader text="Artifacts" />
      <Box
        gap="none"
        border={{ side: 'between', color: 'border' }}
      >
        {artifacts.map(artifact => (
          <Artifact
            key={artifact.id}
            {...artifact}
          />
        ))}
      </Box>
    </DetailContainer>
  )
}
