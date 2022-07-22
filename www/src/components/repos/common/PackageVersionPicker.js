import { Box } from 'grommet'

import { MenuItem, Select } from 'honorable'

import { Chip } from 'pluralsh-design-system'

// TODO: Implement view more functionality as at the moment it loads only the first page.
export function PackageVersionPicker({ version, setVersion, edges }) {

  return (
    <Box
      gap="small"
      margin={{ bottom: 'medium' }}
    >
      <Select
        value={version}
        onChange={({ target: { value } }) => setVersion(value)}
      >
        {edges.map(({ node }) => (
          <MenuItem
            key={node.id}
            value={node}
          >
            <Box direction="row"><Box fill>{node.version}</Box></Box>
          </MenuItem>
        ))}
      </Select>
      <Box
        direction="row"
        gap="xxsmall"
      >
        {version?.tags.map(({ tag }, i) => <Chip key={i}>{tag}</Chip>)}
      </Box>
    </Box>
  )
}
