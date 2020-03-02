defmodule Watchman.Services.Webhooks do
  use Watchman.Services.Base
  alias Watchman.Schema.Webhook
  alias Watchman.Webhooks.Formatter

  @headers [
    {"content-type", "application/json"},
    {"accept", "application/json"}
  ]

  def create(attrs) do
    %Webhook{type: :piazza, health: :healthy}
    |> Webhook.changeset(attrs)
    |> Watchman.Repo.insert()
  end

  def deliver(build, %Webhook{url: url, type: type} = wh) do
    formatter = formatter(type)

    with {:ok, payload} <- formatter.format(build) do
      Mojito.post(url, @headers, Jason.encode!(payload), pool: false)
      |> mark_webhook(wh)
    end
  end

  defp mark_webhook({:ok, _}, wh), do: set_health(wh, :healthy)
  defp mark_webhook(_, wh), do: set_health(wh, :unhealthy)

  defp set_health(%Webhook{} = wh, health) do
    wh
    |> Webhook.changeset(%{health: health})
    |> Watchman.Repo.update()
  end

  defp formatter(:piazza), do: Formatter.Piazza
end