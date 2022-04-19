import { Box, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet'

function NoInformation() {
  return (
    <Box
      fill
      align="center"
      justify="center"
    >
      <Text size="small">No cluster information present</Text>
    </Box>
  )
}

function Header() {
  return (
    <TableHeader>
      <TableRow>
        <TableCell
          scope="col"
          border="bottom"
        >
          Name
        </TableCell>
        <TableCell
          scope="col"
          border="bottom"
        >
          Value
        </TableCell>
      </TableRow>
    </TableHeader>
  )
}

const truncate = str => str && str.length > 20 ? `${str.substring(0, 17)}...` : str

function Row({ name, value }) {
  return (
    <TableRow>
      <TableCell scope="row">
        <strong>{name}</strong>
      </TableCell>
      <TableCell>{truncate(value)}</TableCell>
    </TableRow>
  )
}

export function ClusterInformation({ incident: { clusterInformation } }) {
  if (!clusterInformation) return <NoInformation />

  const { __typename, ...info } = clusterInformation

  return (
    <Box
      fill
      pad="small"
    >
      <Table>
        <Header />
        <TableBody>
          {Object.entries(info).map(([key, value]) => (
            <Row
              key={key}
              name={key}
              value={value}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
