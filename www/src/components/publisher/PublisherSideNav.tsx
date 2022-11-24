import { Div, P } from 'honorable'
import { capitalize } from 'lodash'
import { PageCard } from '@pluralsh/design-system'

function PublisherSideNav({ publisher }: any) {
  console.log(publisher)

  return (
    <Div
      marginLeft="medium"
      marginRight="xsmall"
      width={224}
      flexShrink={0}
    >
      <PageCard
        icon={{
          name: capitalize(publisher.name),
          url: publisher.avatar,
        }}
        heading={capitalize(publisher.name)}
        subheading="Publisher"
      />
      <P
        marginTop="medium"
        marginLeft="medium"
        body2
        color="text-light"
      >
        {publisher.description}
      </P>
    </Div>
  )
}

export default PublisherSideNav
