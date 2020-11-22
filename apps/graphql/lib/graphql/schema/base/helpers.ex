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

  def safe_resolver(fun) do
    fn args, ctx ->
      try do
        case fun.(args, ctx) do
          {:ok, res} -> {:ok, res}
          {:error, %Ecto.Changeset{} = cs} -> {:error, resolve_changeset(cs)}
          {:error, {:missing_dep, _}} = error ->
            Core.Services.Dependencies.pretty_print(error)
          error -> error
        end
      rescue
        error -> {:error, Exception.message(error)}
      end
    end
  end
end