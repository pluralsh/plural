import { Outlet } from 'react-router-dom'
import {Flex} from 'honorable'

import { ButtonGroup } from '../utils/ButtonGroup'
import React from "react";
import {withRouter} from "../utils/hooks";
import {Input, MagnifyingGlassIcon} from "pluralsh-design-system";

export function packageCardStyle(first: boolean, last: boolean) {
  return {
    backgroundColor: 'fill-one',
    hoverIndicator: 'fill-two',
    color: 'text',
    textDecoration: 'none',
    border: '1px solid border-fill-two',
    borderTop: first ? '1px solid border-fill-two' : 'none',
    borderTopLeftRadius: first ? '4px' : 0,
    borderTopRightRadius: first ? '4px' : 0,
    borderBottomLeftRadius: last ? '4px' : 0,
    borderBottomRightRadius: last ? '4px' : 0,
    align: 'center',
    px: 1,
    py: 0.5,
  }
}
const tabToUrl = new Map<string, string>([
  ['Helm Charts', 'helm'],
  ['Terraform Modules', 'terraform'],
  ['Docker Repositories', 'docker']
])

class RepositoryPackages extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      query: ''
    }
  }

  defaultTab(pathname: string) {
    const tabUrl = pathname.substring(pathname.lastIndexOf('/') + 1)
    return [...tabToUrl.keys()].find(key => tabToUrl.get(key) === tabUrl) || 'Helm Charts'
  }

  render() {
    return (
      <Flex
        direction="column"
        height="100%"
      >
        <Flex justifyContent="space-between">
          <Input
              flexBasis="350px"
              marginRight="medium"
              startIcon={(
                  <MagnifyingGlassIcon
                      size={14}
                  />
              )}
              placeholder="Search a package"
              value={this.state.query}
              onChange={event => this.setState({query: event.target.value})}
          />
          <ButtonGroup
            tabs={[...tabToUrl.keys()]}
            default={this.defaultTab(this.props.location.pathname)}
            onChange={(tab: string) => this.props.navigate(tabToUrl.get(tab))}
          />
        </Flex>
        <Flex
          mt={1}
          direction="column"
          flexGrow={1}
        >
          <Outlet />
        </Flex>
      </Flex>
    )
  }
}

export default withRouter(RepositoryPackages)
