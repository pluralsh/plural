import { Div, P } from 'honorable'

function PublisherSideCar({ publisher }: any) {
  return (
    <Div
      paddingLeft="xsmall"
      marginRight="medium"
      flexShrink={0}
      width={208}
    >
      <Div
        marginTop="xxxlarge"
        border="1px solid border"
        borderRadius="large"
        padding="medium"
      >
        <P
          overline
          color="text-xlight"
          wordBreak="break-word"
        >
          {publisher.name} resources
        </P>
        {/* TODO: Buttons when we have the links implemented in the backend */}
      </Div>
    </Div>
  )
}

export default PublisherSideCar
