defmodule Core.MCP.Tools.ModifyProPlan do
  @behaviour Core.MCP.Tool
  alias Core.Repo
  alias Core.Schema.PlatformPlan
  alias Core.Services.Payments

  def name(), do: "modify_pro_plan"

  def description(), do: "Modify the pro plans price configuration"

  def schema() do
    %{
      type: "object",
      required: ["base_price_id", "metered_price_id"],
      properties: %{
        base_price_id: %{
          type: "string",
          description: "The base price id (this will be a stripe price id)"
        },
        metered_price_id: %{
          type: "string",
          description: "The metered price id (this will be a stripe price id)"
        }
      }
    }
  end

  def invoke(%{"base_price_id" => base_price_id, "metered_price_id" => metered_price_id}) do
    Payments.pro_plan!()
    |> PlatformPlan.price_changeset(%{base_price_id: base_price_id, metered_price_id: metered_price_id})
    |> Repo.update()
    |> case do
      {:ok, _} -> {:ok, "Pro plan updated"}
      {:error, changeset} -> {:error, "Failed to update pro plan: #{inspect(changeset)}"}
    end
  end
end
