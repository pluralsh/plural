defprotocol Watchman.PubSub.Webhook do
  @moduledoc """
  Delivers build status events to the configured incoming webhook
  """

  @spec deliver(struct) :: {:ok, map} | :ok
  def deliver(event)
end

defmodule Watchman.Webhook.Request do
  alias Watchman.Schema.Build

  def structured(%Build{id: id, repository: repo, status: status}) do
    """
<root>
  <attachment accent="#{color(status)}" direction="row" pad="small" gap="xsmall" margin="small">
    <text>#{status_modifier(status)} #{repo} using watchman:</text>
    <link href="#{build_url(id)}">
      build logs
    </link>
  </attachment>
</root>
"""
  end

  def text(%Build{repository: repo, status: status}),
    do: "#{status_modifier(status)} #{repo}"

  defp color(:successful), do: "green"
  defp color(:failed), do: "red"

  defp status_modifier(:successful), do: "Successfully deployed"
  defp status_modifier(:failed), do: "Failed to deploy"

  defp build_url(id), do: "https://#{Watchman.conf(:url)}/build/#{id}"
end

defimpl Watchman.PubSub.Webhook, for: [Watchman.PubSub.BuildSucceeded, Watchman.PubSub.BuildFailed] do
  import Watchman.Webhook.Request
  def deliver(%{item: build}),
    do: {:ok, %{text: text(build), structured_message: structured(build)}}
end