import { A, P } from 'honorable'

import { ScrollablePage } from '../utils/layout/ScrollablePage'

function RoadmapFeedback() {
  return (
    <ScrollablePage heading="Feedback">
      <P
        body2
        color="text-xlight"
      >
        Hearing your feedback is important to us and helps shape our roadmap and
        make our product better.
      </P>
      <A
        inline
        display="block"
        target="_blank"
        rel="noopener noreferrer"
        href="https://discord.gg/pluralsh"
      >
        Give us feedback on discord.
      </A>
    </ScrollablePage>
  )
}

export default RoadmapFeedback
