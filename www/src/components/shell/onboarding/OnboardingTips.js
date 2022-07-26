import {
  A, Code, Div, P,
} from 'honorable'
import { TipCarousel } from 'pluralsh-design-system'

function TipCode(props) {
  return (
    <Code
      backgroundColor="fill-two"
      font-style="normal"
      paddingTop="0.1em"
      paddingBottom="0.2em"
      paddingHorizontal="0.5em"
      marginHorizontal="0.1em"
      borderRadius="normal"
      border="1px solid border-fill-two"
      {...props}
    />
  )
}

function OnboardingTips({ autoAdvanceTime = 10000, ...props }) {
  return (
    <Div {...props}>
      <TipCarousel
        autoAdvanceTime={autoAdvanceTime}
      >
        {[
          <>
            You can use service accounts to have an entire team manage a set installations for one of your plural clusters. Learn more{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/advanced-topics/identity-and-access-management/identity-and-installations/service-accounts"
            >
              here
            </A>.
          </>,
          <P margin={0}>
            Plural can be an identity provider for most web facing applications using OpenId Connect. Learn more{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/basic-setup-and-deployment/openid-connect"
            >
              here
            </A>.
          </P>,
          <>
            You can use <TipCode>plural watch &lt;app&gt;</TipCode> to track the status of an application&nbsp;being&nbsp;deployed.
          </>,
          <>
            If you want to share an encrypted plural git repo, you can use age encryption to securely share encryption keys with a group of users, following the guides{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/advanced-topics/identity-and-access-management/identity-and-installations/sharing-existing-repos"
            >
              here
            </A>.
          </>,
          <>
            You can use <TipCode>plural shell sync</TipCode> to transfer your state from the Plural Cloud Shell to the command line.
          </>,
          <>
            You can use <TipCode>plural create</TipCode> to try out adding an application to the Plural catalog.
          </>,
        ]}
      </TipCarousel>
    </Div>
  )
}

export default OnboardingTips
