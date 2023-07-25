import { Group, GroupConnection } from '../../../generated/graphql'

const toGroups = (connection?: GroupConnection): Array<Group> =>
  connection?.edges?.map((e) => e!.node!) ?? []

export { toGroups }
