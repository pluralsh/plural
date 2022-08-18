import { Box } from 'grommet'
import { A, Span } from 'honorable'
import { ArrowLeftIcon } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

export function GoBack({ text, link }) {
  return (
    <Box
      direction="row"
      pad={{ horizontal: '32px', top: 'medium', bottom: 'small' }}
    >
      <A
        as={Link}
        to={link}
        fontFamily="Monument Semi-Mono, monospace"
        fontWeight={500}
        display="flex"
        alignContent="center"
      >
        <ArrowLeftIcon
          size={14}
          marginRight="13px"
        />
        <Span>{text}</Span>
      </A>
    </Box>
  )
}
