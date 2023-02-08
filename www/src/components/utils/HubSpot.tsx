import { useEffect, useState } from 'react'
import useScript from 'react-script-hook'

import Cookiebot from '../../utils/cookiebot'

function HubSpotScript() {
  useScript({ src: 'https://js.hs-scripts.com/22363579.js' })

  return null
}

export function HubSpot() {
  const [loadScript, setLoadScript] = useState(Cookiebot.consent.marketing)

  useEffect(() => {
    const stop = () => {
      const _hsq = ((window as any)._hsq = (window as any)._hsq || [])

      _hsq.push(['doNotTrack'])
    }
    const start = () => {
      setLoadScript(true)
      const _hsq = ((window as any)._hsq = (window as any)._hsq || [])

      _hsq.push(['doNotTrack', { track: true }])
    }

    window.addEventListener('CookiebotOnAccept', start)
    window.addEventListener('CookiebotOnDecline', stop)

    return () => {
      window.removeEventListener('CookiebotOnAccept', start)
      window.removeEventListener('CookiebotOnDecline', stop)
    }
  }, [])

  if (loadScript) {
    return <HubSpotScript />
  }

  return null
}
