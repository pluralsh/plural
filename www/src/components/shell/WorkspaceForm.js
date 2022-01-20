import { Box } from 'grommet'
import React from 'react'
import { LabelledInput } from '../users/MagicLogin'
import { SuffixedInput } from '../utils/AffixedInput'

export function WorkspaceForm({workspace, setWorkspace}) {
  return (
    <Box gap='small'>
      <LabelledInput 
        label='cluster'
        width='100%'
        placeholder='alphanumeric cluster name'
        value={workspace.cluster}
        onChange={(value) => setWorkspace({...workspace, cluster: value})} />
      <LabelledInput 
        label='bucket prefix'
        width='100%'
        placeholder='small unique string to deduplicate s3-like buckets'
        value={workspace.bucketPrefix}
        onChange={(value) => setWorkspace({...workspace, bucketPrefix: value})} />
      <SuffixedInput
        value={workspace.subdomain}
        placeholder='subdomain'
        suffix='.onplural.sh'
        onChange={(val) => setWorkspace({...workspace, subdomain: val})} />
    </Box>
  )
}