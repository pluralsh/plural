defmodule Watchman.Services.Forge do
  def values_file(repository) do
    vals_filename(repository)
    |> File.read()
  end

  def update_configuration(repository, update) do
    with {:ok, _} <- YamlElixir.read_from_string(update),
         :ok <- File.write(vals_filename(repository), update),
      do: {:ok, update}
  end

  defp vals_filename(repository) do
    Path.join([Watchman.workspace(), repository, "helm", repository, "values.yaml"])
  end
end