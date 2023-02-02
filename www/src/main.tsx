import 'babel-polyfill'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'

import App from './App'

import * as serviceWorker from './serviceWorkerRegistration'

export interface Cookiebot {
  consent: {
    necessary: boolean;
    preferences: boolean;
    statistics: boolean;
    marketing: boolean;
    method: string | null;
  };
  consented: boolean;
  declined: boolean;
  hasResponse: boolean;
  doNotTrack: boolean;
  regulations: {
    gdprApplies: boolean;
    ccpaApplies: boolean;
    lgpdApplies: boolean;
  }
  show(): void;
  hide(): void;
  getScript(url: string, async: boolean, callback: () => void): void;
  withdraw(): void;
  submitCustomConsent(optinPreferences: boolean, optinStatistics: boolean, optinMarketing: boolean): void;
}

declare const Cookiebot: Cookiebot

posthog.init('phc_r0v4jbKz8Rr27mfqgO15AN5BMuuvnU8hCFedd6zpSDy',
  {
    api_host: 'https://posthog.plural.sh',
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  })

function startPosthog() {
  posthog.opt_in_capturing()
}

function stopPosthog() {
  posthog.opt_out_capturing()
}

function onPrefChange() {
  if (Cookiebot.consent.statistics) {
    startPosthog()
  }
  else {
    stopPosthog()
  }
}

window.addEventListener('CookiebotOnAccept', onPrefChange)
window.addEventListener('CookiebotOnDecline', onPrefChange)
onPrefChange()

const container = document.getElementById('root') as Element
const root = createRoot(container)

root.render(<App />)

serviceWorker.register({})
