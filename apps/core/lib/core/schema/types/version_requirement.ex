defmodule Core.Schema.VersionRequirement do
  use Ecto.Type

  def type, do: :string

  def cast(req) do
    with {:ok, _} <- Version.parse_requirement(req),
      do: {:ok, req}
  end

  def load(url), do: {:ok, url}

  def dump(url), do: {:ok, url}
end