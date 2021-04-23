defmodule Plural.Chart do
  def images(yaml) do
    with {:ok, res} <- YamlElixir.read_all_from_string(yaml),
      do: {:ok, recursively_find_images(res)}
  end

  defp recursively_find_images(%{} = result) do
    Enum.flat_map(result, fn
      {"image", val} when is_binary(val) -> [val]
      {_, val} -> recursively_find_images(val)
    end)
  end

  defp recursively_find_images(items) when is_list(items),
    do: Enum.flat_map(items, &recursively_find_images/1)

  defp recursively_find_images(_), do: []
end
