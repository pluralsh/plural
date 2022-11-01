import { GrowthBook } from '@growthbook/growthbook'

// Create a GrowthBook instance
export const growthbook = new GrowthBook({
  trackingCallback: (experiment, result) => {
    console.log({
      experimentId: experiment.key,
      variationId: result.variationId,
    })
  },
})

// Load feature definitions from API
// In production, we recommend putting a CDN in front of the API endpoint
const FEATURES_ENDPOINT = 'https://growthbook-api.plural.sh/api/features/key_prod_0a0bb850b46792cc'

fetch(FEATURES_ENDPOINT)
  .then(res => res.json())
  .then(json => growthbook.setFeatures(json.features))
  .catch(() => {
    console.log('Failed to fetch feature definitions from GrowthBook')
  })
