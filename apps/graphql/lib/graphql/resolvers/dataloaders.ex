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

defmodule GraphQl.LockLoader do
  alias Core.Schema.Installation

  def data(_) do
    Dataloader.KV.new(&query/2, max_concurrency: 1)
  end

  def query(_, ids) do
    locks = fetch_locks(ids)
    Map.new(ids, & {&1, !!locks[&1]})
  end

  def fetch_locks(ids) do
    MapSet.to_list(ids)
    |> Installation.for_ids()
    |> Installation.locks()
    |> Core.Repo.all()
    |> Map.new(& {&1.id, &1.locked})
  end
end

defmodule GraphQl.SyncLoader do
  alias Core.Schema.Installation

  def data(_) do
    Dataloader.KV.new(&query/2, max_concurrency: 1)
  end

  def query(_, ids) do
    unsynced = fetch_unsynced(ids)
    Map.new(ids, & {&1, !unsynced[&1]})
  end

  def fetch_unsynced(ids) do
    MapSet.to_list(ids)
    |> Installation.for_ids()
    |> Installation.unsynced()
    |> Core.Repo.all()
    |> Map.new(& {&1.id, &1.synced})
  end
end

defmodule GraphQl.ShellLoader do
  alias Core.Schema.CloudShell

  def data(_) do
    Dataloader.KV.new(&query/2, max_concurrency: 1)
  end

  def query(_, ids) do
    shells = fetch_shells(ids)
    Map.new(ids, & {&1, !!shells[&1]})
  end

  def fetch_shells(ids) do
    MapSet.to_list(ids)
    |> CloudShell.for_users()
    |> Core.Repo.all()
    |> Map.new(& {&1.user_id, &1})
  end
end
