import {
  Div, DivProps, Flex, H1, P,
} from 'honorable'
import { ReactNode } from 'react'

type PageHeaderProps = {
  header?: ReactNode;
  description?: ReactNode;
} & DivProps;
export function PageHeader({
  header = '',
  description = '',
  children,
  ...props
}: PageHeaderProps) {
  return (
    <Flex
      borderBottom="1px solid border"
      paddingBottom="large"
      marginBottom="large"
      alignItems="center"
      justifyContent="space-between"
      {...props}
    >
      <Div alignSelf="flex-start">
        <Div alignSelf="bottom">
          <H1 title1>{header}</H1>
          {description && (
            <P
              color="text-light"
              body1
              marginTop="xsmall"
            >
              {description}
            </P>
          )}
        </Div>
      </Div>
      {children}
    </Flex>
  )
}
