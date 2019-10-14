defmodule GraphQl.Schema.Helpers do
  import Absinthe.Resolution.Helpers

  def resolve_changeset(%Ecto.Changeset{errors: errors}) do
    Enum.map(errors, fn {field, {msg, _}} -> "#{field} #{msg}" end)
  end

  def manual_dataloader(loader, resolver, queryable, args) do
    loader
    |> Dataloader.load(resolver, queryable, args)
    |> on_load(fn loader ->
      {:ok, Dataloader.get(loader, resolver, queryable, args)}
    end)
  end
end