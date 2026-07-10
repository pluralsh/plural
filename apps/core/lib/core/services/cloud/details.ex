defmodule Core.Services.Cloud.Details do
  import Core, only: [deep_get: 2]
  import Core.Services.Cloud.Utils
  alias Core.Clients.Console
  alias Core.Schema.ConsoleInstance

  defstruct [:aws_assume_role]

  def new(%{} = attrs) do
    %__MODULE__{
      aws_assume_role: deep_get(attrs, ["iam", "bedrock"])
    }
  end

  def details(%ConsoleInstance{type: :shared, external_id: external_id}) do
    console()
    |> Console.service(external_id)
    |> case do
      {:ok, %{"cluster" => %{"metadata" => %{} = meta}}} -> {:ok, new(meta)}
      {:ok, _} -> {:error, "no metadata found"}
      err -> err
    end
  end

  def details(%ConsoleInstance{type: :dedicated, external_id: external_id}) do
    dedicated_console()
    |> Console.stack(external_id)
    |> case do
      {:ok, %{"output" => outputs}} when is_list(outputs) -> {:ok, from_outputs(outputs)}
      {:ok, _} -> {:error, "no metadata found"}
      err -> err
    end
  end

  defp from_outputs([_ | _] = outputs) do
    with %{"value" => value} <- Enum.find(outputs, & &1["name"] == "metadata"),
         {:ok, %{} = meta} <- Jason.decode(value) do
      new(meta)
    else
      _ -> %__MODULE__{}
    end
  end
  defp from_outputs(_), do: %__MODULE__{}
end
