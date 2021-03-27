import { deepUpdate } from "../../utils/graphql"
import { REPO_Q } from "../repos/queries"

export function pivotByDimension(items) {
  return items.reduce((byDim, item) => {
    byDim[item.dimension] = item
    return byDim
  }, {})
}

export function subscriptionCost({lineItems: {items}}, {cost, lineItems}) {
  const planLineItems = pivotByDimension(lineItems.items)
  return items.reduce(
    (total, {dimension, quantity}) => total + planLineItems[dimension].cost * quantity,
    cost
  )
}

export function updateSubscription(cache, repositoryId, subscription) {
  const prev = cache.readQuery({query: REPO_Q, variables: {repositoryId}})
  cache.writeQuery({
    query: REPO_Q,
    variables: {repositoryId},
    data: deepUpdate(prev, 'repository.installation.subscription', () => subscription)
  })
}