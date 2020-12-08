import { GROUP_MEMBERS, GROUPS_Q } from "./queries"

export function addGroupMember(cache, group, member) {
  const {members, ...data} = cache.readQuery({
    query: GROUP_MEMBERS,
    variables: {id: group.id}
  })
  cache.writeQuery({
    query: GROUP_MEMBERS,
    variables: {id: group.id},
    data: {...data, members: {
      ...members,
      edges: [{__typename: "GroupMemberEdge", node: member}, ...members.edges]
    }}
  })
}

export function deleteGroup(cache, group) {
  const {groups, ...data} = cache.readQuery({query: GROUPS_Q, variables: {q: null}})
  cache.writeQuery({
    query: GROUPS_Q,
    variables: {q: null},
    data: {
      ...data,
      groups: {...groups, edges: groups.edges.filter(({node: {id}}) => id !== group.id)}
    }
  })
}