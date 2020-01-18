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