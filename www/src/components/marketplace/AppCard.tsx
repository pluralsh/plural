import { Div, Flex, H3 } from 'honorable'
import { AppIcon, Card } from '@pluralsh/design-system'
import { Severity } from '@pluralsh/design-system/dist/types'
import { ComponentProps, ReactNode } from 'react'

export const getBorderColor = (severity?: Severity) => {
  switch (severity) {
  case 'error':
  case 'danger':
    return 'border-error'
  case 'warning':
    return 'border-warning'
  default:
    return ''
  }
}

type AppCardProps = {
  title: ReactNode
  subtitle?: ReactNode | null
  imageUrl?: string
  severity?: Severity
  rightContent?: ReactNode
} & Partial<ComponentProps<typeof Card>>

export function ListItemBorder({
  color,
  width = 3,
  radius = 4,
}: {
  color: string
  width?: number
  radius?: number
}) {
  return (
    <Div
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      borderRadius={radius}
      overflow="hidden"
    >
      <Div
        position="absolute"
        backgroundColor={color}
        width={width}
        height="100%"
      />
    </Div>
  )
}

export function AppCardBasicInfo({
  imageUrl,
  title,
  subtitle,
}: Pick<AppCardProps, 'imageUrl' | 'title' | 'subtitle'>) {
  return (
    <Flex
      align="center"
      gap="small"
      flexGrow={1}
      flexBasis="40%"
      padding="medium"
    >
      {imageUrl && (
        <AppIcon
          url={imageUrl}
          size="xsmall"
        />
      )}
      <Flex direction="column">
        <H3
          margin={0}
          body1
          fontWeight={600}
        >
          {title}
        </H3>
        {subtitle && <Flex>{subtitle}</Flex>}
      </Flex>
    </Flex>
  )
}

export function AppCard({
  title,
  subtitle,
  imageUrl,
  rightContent,
  children,
  severity,
  ...props
}: AppCardProps) {
  const borderColor = getBorderColor(severity)

  return (
    <Card
      clickable
      display="flex"
      flexGrow={1}
      flexShrink={1}
      flexDirection="column"
      position="relative"
      {...props}
    >
      {borderColor && <ListItemBorder color={borderColor} />}
      <Flex width="100%">
        <AppCardBasicInfo
          title={title}
          subtitle={subtitle}
          imageUrl={imageUrl}
        />
        {rightContent}
      </Flex>
      {children}
    </Card>
  )
}
