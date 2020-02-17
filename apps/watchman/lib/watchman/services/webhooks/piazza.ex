defmodule Watchman.Webhooks.Formatter.Piazza do
  alias Watchman.Schema.Build

  def format(%Build{} = build) do
    {:ok, %{structured_message: structured(build), text: text(build)}}
  end

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