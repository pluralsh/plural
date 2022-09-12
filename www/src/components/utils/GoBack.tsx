import { Link } from 'react-router-dom'
import { Button } from 'honorable'
import { ArrowLeftIcon } from 'pluralsh-design-system'

export function GoBack({
  text, link,
}) {
  return (
    <Button
      tertiary
      as={Link}
      to={link}
      startIcon={(
        <ArrowLeftIcon />
      )}
    >
      {text}
    </Button>
  )
}
