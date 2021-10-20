defmodule Core.Backfill.Repositories do
  alias Core.Schema.Installation

  def license_keys() do
    # there aren't that many
    Core.Repo.all(Installation)
    |> Enum.each(fn inst ->
      {:ok, _} = Installation.changeset(inst, %{})
                   |> Core.Repo.update()
    end)
  end
end
