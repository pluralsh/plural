import { Div, P } from 'honorable'
import { CloseIcon } from 'pluralsh-design-system'

export function ModalHeader({ text, setOpen }) {
  return (
    <Div
      xflex="x4"
      pt={1}
      px={1}
      pad={{ horizontal: 'medium', top: 'medium' }}
    >
      <P body0>
        {text}
      </P>
      <Div flexGrow={1} />
      {typeof setOpen === 'function' && (
        <Div
          p={0.5}
          margin={-0.5}
          xflex="x5"
          width="2rem"
          height="2rem"
          hoverIndicator="background-light"
          onClick={() => setOpen(false)}
          borderRadius="50%"
          cursor="pointer"
        >
          <CloseIcon size={12} />
        </Div>
      )}
    </Div>
  )
}
