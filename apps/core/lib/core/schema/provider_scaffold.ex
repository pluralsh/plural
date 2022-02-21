defmodule Core.Schema.ProviderScaffold do
  defstruct [:name, :content]
  @providers ~w(aws gcp azure equinix)a

  def available(), do: @providers

  def new(name) when name in @providers do
    %__MODULE__{
      name: name,
      content: provider_file(name)
    }
  end

  defp provider_file(name) do
    Path.join([:code.priv_dir(:core), "scaffolds/terraform/providers", "#{name}.eex"])
    |> File.read!
  end
end
