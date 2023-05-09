defmodule Core.Backfill.Repositories do
  alias Core.Schema.{Installation, VersionTag}

  def license_keys() do
    # there aren't that many
    Core.Repo.all(Installation)
    |> Enum.each(fn inst ->
      {:ok, _} = Installation.changeset(inst, %{})
                   |> Core.Repo.update()
    end)
  end

  def warm_to_stable() do
    VersionTag.for_tags(["warm"])
    |> Core.Repo.update_all(set: [tag: "stable"])

    Installation.tracking("warm")
    |> Core.Repo.update_all(set: [track_tag: "stable"])
  end
end
