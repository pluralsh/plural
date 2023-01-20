import Botanist

alias Core.Backfill.Clusters

seed do
  Clusters.trim()
  Clusters.from_queues()
end
