defmodule Core.Schema.ProviderScaffold do
  defstruct [:name, :content]
  @providers ~w(aws gcp azure equinix kind)a

  def available(), do: @providers

  def new(name, vsn \\ :default) when name in @providers do
    %__MODULE__{
      name: name,
      content: provider_file(name, vsn)
    }
  end

  defp provider_file(name, :default) do
    Path.join([:code.priv_dir(:core), "scaffolds/terraform/providers", "#{name}.eex"])
    |> File.read!
  end

  defp provider_file(name, vsn) do
    Path.join([:code.priv_dir(:core), "scaffolds/terraform/providers/#{vsn}", "#{name}.eex"])
    |> case do
       {:ok, resp} -> {:ok, resp} |> File.read!
       error -> "could not find version #{vsn} for the given provider #{name}"
    end
  end
end
