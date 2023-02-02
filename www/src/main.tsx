import 'babel-polyfill'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'

import App from './App'

import * as serviceWorker from './serviceWorkerRegistration'

posthog.init('phc_r0v4jbKz8Rr27mfqgO15AN5BMuuvnU8hCFedd6zpSDy',
  {
    api_host: 'https://posthog.plural.sh',
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  })

const container = document.getElementById('root') as Element
const root = createRoot(container)

root.render(<App />)

serviceWorker.register({})
