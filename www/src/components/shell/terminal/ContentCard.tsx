import { Card } from '@pluralsh/design-system'

function ContentCard({ children }) {
  return (
    <Card
      display="flex"
      height="100%"
      flexGrow={1}
    >
      {children}
    </Card>
  )
}

export default ContentCard
