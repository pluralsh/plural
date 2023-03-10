defmodule GraphQl.Schema.Helpers do
  import Absinthe.Resolution.Helpers
  require Logger

  def resolve_changeset(%Ecto.Changeset{errors: errors, changes: changes}) do
    errors
    |> Enum.map(fn {field, {msg, _}} -> "#{field} #{msg}" end)
    |> Enum.concat(recurse_changeset(changes))
  end

  defp recurse_changeset(%{} = changes) do
    Enum.filter(changes, fn
      {_, %Ecto.Changeset{}} -> true
      _ -> false
    end)
    |> Enum.flat_map(fn {_, changeset} -> resolve_changeset(changeset) end)
  end
  defp recurse_changeset(_), do: []

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
          {:error, %Stripe.Error{user_message: umessage, message: message}} ->
            Logger.info "found stripe error: #{umessage || message}"
            {:error, "Stripe error: #{umessage || message}"}
          {:error, {:missing_dep, _}} = error ->
            Core.Services.Dependencies.pretty_print(error)
          error -> error
        end
      rescue
        error ->
          Logger.error(Exception.format(:error, error, __STACKTRACE__))
          {:error, exception_msg(error)}
      end
    end
  end

  def lazy_dataloader(key, resolver) do
    fn
      %{^key => %Ecto.Association.NotLoaded{}} = s, args, ctx ->
        func = dataloader(resolver)
        func.(s, args, ctx)
      %{^key => v}, _, _ -> {:ok, v}
    end
  end

  defp exception_msg(%Ecto.NoResultsError{}), do: "the resource you requested was not found"
  defp exception_msg(e), do: Exception.message(e)
end
