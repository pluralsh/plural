defmodule GraphQl.Schema.CustomTypes do
  use Absinthe.Schema.Notation
  alias Absinthe.Blueprint

  scalar :map, name: "Map" do
    serialize &mapish/1
    parse fn
      %Blueprint.Input.String{value: value}, _ ->
        Jason.decode(value)
      %Blueprint.Input.Null{}, _ -> {:ok, nil}
      _, _ -> :error
    end
  end

  scalar :yml, name: "Yaml" do
    serialize &mapish/1
    parse fn
      %Blueprint.Input.String{value: value}, _ ->
        YamlElixir.read_from_string(value)
      %Blueprint.Input.Null{}, _ -> {:ok, nil}
      _, _ -> :error
    end
  end

  defp mapish(m) when is_map(m), do: m
  defp mapish(m) when is_binary(m) do
    case Jason.decode(m) do
      {:ok, parsed} -> parsed
      _ -> :error
    end
  end
  defp mapish(_), do: :error
end