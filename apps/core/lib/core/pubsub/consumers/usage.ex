defmodule Core.PubSub.Consumers.Usage do
  @moduledoc nil
  use Piazza.PubSub.Consumer,
    broadcaster: Core.PubSub.Broadcaster,
    max_demand: 10
  alias Core.Schema.Account

  def handle_event(event) do
    with {account_id, [_ | _] = counts} <- Core.PubSub.Usage.update(event) do
      apply_counts(account_id, counts)
    end
  end

  def apply_counts(account_id, counts) do
    Account.for_id(account_id)
    |> Core.Repo.update_all(
      set: [usage_updated: true, updated_at: Timex.now()],
      inc: convert(counts)
    )
  end

  defp convert(counts) do
    Enum.map(counts, fn {name, count} -> {:"#{name}_count", count} end)
  end
end
