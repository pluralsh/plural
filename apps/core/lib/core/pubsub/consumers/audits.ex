defmodule Core.PubSub.Consumers.Audits do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  alias Core.Schema.{Audit, AuditContext}

  def handle_event(event) do
    with %Audit{} = audit <- Core.PubSub.Auditable.audit(event) do
      audit
      |> Audit.changeset(context(event))
      |> Core.Repo.insert()
    end
  end

  defp context(%{context: %AuditContext{} = ctx}), do: Map.from_struct(ctx)
  defp context(_), do: %{}
end
