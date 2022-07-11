import { createRoot } from 'react-dom/client'

import App from './App.tsx'

import * as serviceWorker from './serviceWorker'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)

serviceWorker.register()
