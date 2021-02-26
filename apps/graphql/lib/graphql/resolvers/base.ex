defmodule GraphQl.Resolvers.Base do
  @moduledoc """
  Scaffolding for configuring dataloader and adding some useful helper functions.

  Absinthe is very opinionated and it's patterns don't lend to great code reuse.  In
  that case, at least for mutations, we should have a pattern of defining a absinthe-y
  function head that delegates to a more natural erlang definition in a services module

  ```
  def update_user(%{id: id, attributes: attrs}, %{context: %{current_user: user}}),
    do: Users.update_user(id, attrs, user)
  ```
  """
  alias Absinthe.Relay
  defmacro __using__(model: model) do
    quote do
      import GraphQl.Resolvers.Base
      alias unquote(model)
      def data(args \\ %{}),
        do: Dataloader.Ecto.new(Core.Repo, query: &query/2, default_params: filter_context(args))

      def query(_queryable, _args), do: unquote(model).any()

      defoverridable [query: 2, data: 1]
    end
  end

  def maybe_search(query, model, %{q: q}) when is_binary(q), do: model.search(query, q)
  def maybe_search(query, _, _), do: query

  def filter_context(ctx) do
    Map.take(ctx, [:current_user])
  end

  def paginate(query, args) do
    Relay.Connection.from_query(query, &Core.Repo.all/1, args)
  end
end
