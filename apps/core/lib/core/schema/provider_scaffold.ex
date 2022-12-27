defmodule Core.Schema.ProviderScaffold do
  defstruct [:name, :content]
  @providers ~w(aws gcp azure equinix kind generic)a

  def available(), do: @providers

  def new(name, vsn \\ :default) when name in @providers do
    with {:ok, content} <- provider_file(name, vsn) do
      {:ok, %__MODULE__{name: name, content: content}}
    end
  end

  defp provider_file(name, :default) do
    Path.join([:code.priv_dir(:core), "scaffolds/terraform/providers", "#{name}.eex"])
    |> File.read()
    |> handle_read(name, :default)
  end

  defp provider_file(name, vsn) do
    Path.join([:code.priv_dir(:core), "scaffolds/terraform/providers/#{vsn}", "#{name}.eex"])
    |> File.read
    |> handle_read(name, vsn)
  end

  defp handle_read({:ok, content}, _, _), do: {:ok, content}
  defp handle_read(_, name, vsn), do: {:error, "could not find provider #{name} with version #{vsn}"}
end
