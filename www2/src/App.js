import { ApolloProvider } from '@apollo/client'

import { client } from './helpers/client'

function App() {
  return (
    <ApolloProvider client={client}>
      foo
    </ApolloProvider>
  )
}

export default App
