import { render } from 'react-dom'

import * as serviceWorker from './serviceWorker'
import App from './App'

render(
  <App />,
  document.getElementById('root')
)

serviceWorker.register()
