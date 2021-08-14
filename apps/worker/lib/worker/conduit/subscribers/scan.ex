defmodule Worker.Conduit.Subscribers.Scan do
  use Conduit.Subscriber
  import Conduit.Message
  alias Core.Services.Versions
  alias Core.Schema.{Version, Chart, Terraform}
  require Logger

  def process(%Conduit.Message{body: body} = msg, _) do
    case scan(body) do
      {:ok, _} -> ack(msg)
      _ -> nack(msg)
    end
  end

  def scan(version) do
    {type, url} = scan_details(version)
    {output, _} = System.cmd("terrascan", [
      "scan",
      "--iac-type", type,
      "--remote-type", "http",
      "--remote-url", url,
      "--output", "json",
      "--use-colors", "f"
    ])
    Logger.info "terrascan output: #{output}"
    Versions.record_scan(output, version)
  end

  defp scan_details(%Version{
    version: v,
    chart: %Chart{name: chart, repository: %{name: name}}
  }) do
    {"helm", "http://chartmuseum:8080/cm/#{name}/#{chart}-#{v}.tgz"}
  end
  defp scan_details(%Version{terraform: %Terraform{}} = v),
    do: {"terraform", Core.Storage.url({v.package, v}, :original)}
end
