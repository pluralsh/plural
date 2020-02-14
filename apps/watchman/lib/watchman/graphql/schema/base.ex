defmodule Watchman.GraphQl.Schema.Base do
  defmacro __using__(_) do
    quote do
      use Absinthe.Schema.Notation
      use Absinthe.Relay.Schema.Notation, :modern
      import Absinthe.Resolution.Helpers
      import Watchman.GraphQl.Schema.Base
      import_types Absinthe.Type.Custom

      enum :delta do
        value :create
        value :update
        value :delete
      end

      enum :direction do
        value :before
        value :after
      end
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
end