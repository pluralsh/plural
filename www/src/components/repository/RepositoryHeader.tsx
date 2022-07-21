import { Div, Hr, P } from 'honorable'
import { Divider } from 'pluralsh-design-system'

function RepositoryHeader({ children, ...props }: any) {

  return (
    <Div
      width="100%"
      marginBottom="medium"
      position="sticky"
      top={0}
      {...props}
    >
      <Div
        width="100%"
        backgroundColor="fill-zero"
        paddingTop="large"
      >
        <P title1>
          {children}
        </P>
        <Hr
          marginTop={18}
          marginBottom={0}
        />
      </Div>
    </Div>
  )
}

export default RepositoryHeader
