import { createRoot } from 'react-dom/client'

import App from './App'

import * as serviceWorker from './serviceWorkerRegistration'

const container = document.getElementById('root') as Element
const root = createRoot(container)

root.render(<App />)

serviceWorker.register({})
