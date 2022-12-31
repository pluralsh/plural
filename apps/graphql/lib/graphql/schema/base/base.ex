defmodule GraphQl.Schema.Base do
  defmacro __using__(_) do
    quote do
      use Absinthe.Schema.Notation
      use Absinthe.Relay.Schema.Notation, :modern
      import Absinthe.Resolution.Helpers
      import GraphQl.Schema.Helpers
      import GraphQl.Schema.Base
      alias GraphQl.Middleware.{Authenticated, Differentiate}
    end
  end

  defmacro timestamps() do
    quote do
      field :inserted_at, :datetime
      field :updated_at, :datetime
    end
  end

  defmacro delta(type) do
    delta_type = :"#{type}_delta"
    quote do
      object unquote(delta_type) do
        field :delta, :delta
        field :payload, unquote(type)
      end
    end
  end

  defmacro ecto_enum(name, module) do
    module = Macro.expand(module, __CALLER__)
    values = module.__enum_map__()
             |> Enum.map(fn {key, _} ->
                quote do
                  value unquote(key)
                end
             end)
    quote do
      enum unquote(name) do
        unquote(values)
      end
    end
  end

  defmacro enum_from_list(name, m, f, a) do
    module = Macro.expand(m, __CALLER__)
    values = apply(module, f, a) |> Enum.map(fn key ->
      quote do
        value unquote(key)
      end
    end)

    quote do
      enum unquote(name) do
        unquote(values)
      end
    end
  end

  defmacro image(name, opts \\ []) do
    field_name = Keyword.get(opts, :field, name)
    quote do
      field unquote(name), :string, resolve: fn
        res, _, _ -> {:ok, Core.Storage.url({Map.get(res, unquote(field_name)), res}, :original)}
      end
    end
  end

  defmacro safe_resolve(func) do
    quote do
      resolve safe_resolver(unquote(func))
    end
  end
end
