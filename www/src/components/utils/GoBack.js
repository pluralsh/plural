import { A, Flex } from 'honorable'
import { ArrowLeftIcon } from 'pluralsh-design-system'
import { Link } from 'react-router-dom'

export function GoBack({
  text, link, as = Link, ...props
}) {
  return (
    <Flex
      direction="row"
      paddingHorizontal="xxlarge"
      paddingVertical="large"
      {...props}
    >
      <A
        as={as}
        to={link}
        fontFamily="Monument Semi-Mono, monospace"
        fontWeight={500}
        display="flex"
        alignContent="center"
      >
        <ArrowLeftIcon
          size={14}
          marginRight={14}
        />
        {text}
      </A>
    </Flex>
  )
}
