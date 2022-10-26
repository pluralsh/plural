import { Div, Flex, P } from 'honorable'
import { CloseIcon } from 'pluralsh-design-system'

export function ModalHeader({ text, setOpen }) {
  return (
    <Flex
      align="center"
      pt={1}
      px={1}
      pad={{ horizontal: 'medium', top: 'medium' }}
    >
      <P body0>
        {text}
      </P>
      <Div flexGrow={1} />
      {typeof setOpen === 'function' && (
        <Flex
          p={0.5}
          margin={-0.5}
          align="center"
          justify="center"
          width="2rem"
          height="2rem"
          hoverIndicator="fill-one"
          onClick={() => setOpen(false)}
          borderRadius="50%"
          cursor="pointer"
        >
          <CloseIcon size={12} />
        </Flex>
      )}
    </Flex>
  )
}
