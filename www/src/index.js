import { createRoot } from 'react-dom/client'

import App from './App'

import * as serviceWorker from './serviceWorkerRegistration.ts'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(<App />)

serviceWorker.register()
