defmodule Core.Services.Locks do
  use Core.Services.Base
  alias Core.Schema.Lock

  def acquire(name, owner) do
    Lock.with_lock()
    |> Core.Repo.get_by(name: name)
    |> case do
      %Lock{owner: nil} = l -> l
      nil -> %Lock{name: name}
    end
    |> Lock.changeset(%{owner: owner})
    |> Core.Repo.insert_or_update()
  end

  def release(name) do
    Core.Repo.get_by(Lock, name: name)
    |> Lock.changeset(%{owner: nil})
    |> Core.Repo.update()
  end
end
