import { useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex } from '@pluralsh/design-system'

import { lookahead } from '../utils/array'

import BreadcrumbsContext, {
  BreadcrumbsContextType,
} from '../contexts/BreadcrumbsContext'

import { Body2BoldP, Body2P, InlineLinkButtonSC } from './utils/Typography'

function CrumbLink({ crumb: { url, text, disable } }: any) {
  const navigate = useNavigate()

  // TODO: new design does not cover the "disabled" state. Should it be removed?
  if (disable) {
    return (
      <Body2P
        as="span"
        $color="text-xlight"
      >
        {text}
      </Body2P>
    )
  }

  return (
    <InlineLinkButtonSC onClick={() => navigate(url)}>
      {text}
    </InlineLinkButtonSC>
  )
}

export function Breadcrumbs() {
  const { breadcrumbs } = useContext(BreadcrumbsContext)

  if (breadcrumbs.length === 0) return null

  const children = Array.from(
    lookahead(breadcrumbs, (crumb, next) => {
      if (next.url) {
        return [
          <CrumbLink
            key={crumb.url + crumb.text}
            crumb={crumb}
          />,
          <Body2P
            as="span"
            key={`${crumb.url + crumb.text}next`}
          >
            /
          </Body2P>,
        ]
      }

      return (
        <Body2BoldP
          as="span"
          key={crumb.url + crumb.text}
        >
          {crumb.text}
        </Body2BoldP>
      )
    }) as any as any[]
  ).flat()

  return (
    <Flex
      flex="0 0 auto"
      direction="row"
      gap="xsmall"
      align="center"
      paddingRight="small"
      paddingLeft="1px"
    >
      {children}
    </Flex>
  )
}

export default function BreadcrumbProvider({ children }: any) {
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])
  const value = useMemo<BreadcrumbsContextType>(
    () => ({ breadcrumbs, setBreadcrumbs }),
    [breadcrumbs]
  )

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
