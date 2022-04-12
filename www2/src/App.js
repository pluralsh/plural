import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Grommet } from 'grommet'
import { theme } from 'pluralsh-design-system'

import { client } from './helpers/client'
import { INTERCOM_APP_ID } from './constants'

function App() {
  return (
    <ApolloProvider client={client}>
      <IntercomProvider appId={INTERCOM_APP_ID}>
        <Grommet
          full
          theme={theme}
        >
          foo
        </Grommet>
      </IntercomProvider>
    </ApolloProvider>
  )
}

export default App
