import 'babel-polyfill'
import { createRoot } from 'react-dom/client'

import App from './App'
import { hydrateAuthToken } from './helpers/authentication'

import * as serviceWorker from './serviceWorkerRegistration'

const container = document.getElementById('root') as Element
const root = createRoot(container)

async function boot() {
  await hydrateAuthToken()
  root.render(<App />)
  serviceWorker.register({})
}

void boot()
