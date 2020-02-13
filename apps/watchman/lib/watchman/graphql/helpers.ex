defmodule Watchman.GraphQl.Helpers do
  import Absinthe.Resolution.Helpers

  def resolve_changeset(%Ecto.Changeset{errors: errors}) do
    Enum.map(errors, fn {field, {msg, _}} -> "#{field} #{msg}" end)
  end
end