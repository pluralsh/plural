import posthog from 'posthog-js'

import Cookiebot from './cookiebot'

export default function PosthogIdentiy(me: any) {
  if (Cookiebot.consent.statistics) {
    posthog.opt_in_capturing()
    posthog.identify(me.id)
    posthog.people.set({
      // should email be under the GDPR check?
      email: me.email,
      accountId: me.account.id,
      accountName: me.account.name,
    })
    if (!Cookiebot.regulations.gdprApplies) {
      posthog.people.set({
        name: me.name,
      })
    }
  }
  else {
    posthog.opt_out_capturing()
  }
}
