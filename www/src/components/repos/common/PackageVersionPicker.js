import { Box } from 'grommet'

import { MenuItem, Select, Text } from 'honorable'

import { Chip } from 'pluralsh-design-system'

// TODO: Implement view more functionality as at the moment it loads only the first page.
// TODO: Show only 6 elements inside select component and add scroll (to be done globally).
export function PackageVersionPicker({ edges, installed, version, setVersion }) {

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
            <Box
              fill
              direction="row"
              justify="center"
            >
              <Box fill>{node.version}</Box>
              {node.id === installed?.version?.id && (
                <Chip
                  severity="success"
                  style={{ height: '20px' }}
                >
                  <Text fontSize="12px">Installed</Text>
                </Chip>
              )}
            </Box>
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
