defmodule Core.MCP.Tools.WireSubscription do
  @behaviour Core.MCP.Tool
  alias Core.Services.{Payments}

  def name(), do: "wire_subscription"

  def description(), do: "wires a pro plan subscription for a user"

  def schema() do
    %{
      type: "object",
      required: ["email", "customer_id", "subscription_id"],
      properties: %{
        email: %{
          type: "string",
          description: "The email of the user who we want to wire in a new subscription for"
        },
        customer_id: %{
          type: "string",
          description: "The stripe customer id to wire the subscription for"
        },
        subscription_id: %{
          type: "string",
          description: "The stripe subscription id to wire the subscription for"
        }
      }
    }
  end

  def invoke(%{"email" => email, "customer_id" => customer_id, "subscription_id" => subscription_id})
      when is_binary(email) and is_binary(customer_id) and is_binary(subscription_id) do
    case Payments.backfill_subscription(email, customer_id, subscription_id) do
      {:ok, _} -> {:ok, "subscription wired for #{email}"}
      err -> err
    end
  end
  def invoke(_), do: {:error, "email, customer_id, and subscription_id are required"}
end
