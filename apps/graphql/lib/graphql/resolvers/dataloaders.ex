defmodule GraphQl.InstallationLoader do
  alias Core.Schema.Installation

  def data(_) do
    Dataloader.KV.new(&query/2, max_concurrency: 1)
  end

  def query(_, ids) do
    insts = fetch_insts(ids)
    Map.new(ids, & {&1, insts[&1]})
  end

  def fetch_insts(ids) do
    MapSet.to_list(ids)
    |> Installation.for_ids()
    |> Core.Repo.all()
    |> Map.new(& {&1.id, &1})
  end
end
