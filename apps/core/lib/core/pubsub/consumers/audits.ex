defmodule Core.PubSub.Consumers.Audits do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  alias Core.Schema.Audit

  def handle_event(event) do
    with %Audit{} = audit <- Core.PubSub.Auditable.audit(event) do
      audit
      |> Audit.changeset(%{})
      |> Core.Repo.insert()
    end
  end
end
