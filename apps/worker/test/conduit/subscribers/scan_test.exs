defmodule Worker.Conduit.Subscribers.ScanTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Worker.Conduit.Subscribers.Scan

  describe "process/2" do
    test "it can scan a terraform version" do
      result = Path.join(:code.priv_dir(:core), "scan.json") |> File.read!()
      version = insert(:version,
        terraform: insert(:terraform, package: %{file_name: "file.tgz", updated_at: nil}),
        chart: nil,
        chart_id: nil
      )
      url = Core.Storage.url({version.package, version}, :original)
      expect(System, :cmd, fn
        "terrascan", [
          "scan",
          "--iac-type", "terraform",
          "--remote-type", "http",
          "--remote-url", ^url,
          "--output", "json",
          "--use-colors", "f"
        ] ->
          {result, 0}
      end)

      {:ok, scanned} = Scan.scan(version)

      assert scanned.grade == :d
    end

    test "it can scan a chart version" do
      result = Path.join(:code.priv_dir(:core), "scan.json") |> File.read!()
      version = insert(:version, chart: insert(:chart))
      url = "http://chartmuseum:8080/cm/#{version.chart.repository.name}/#{version.chart.name}-#{version.version}.tgz"
      expect(System, :cmd, fn
        "terrascan", [
          "scan",
          "--iac-type", "helm",
          "--remote-type", "http",
          "--remote-url", ^url,
          "--output", "json",
          "--use-colors", "f"
        ] ->
          {result, 0}
      end)

      {:ok, scanned} = Scan.scan(version)

      assert scanned.grade == :d
    end
  end
end
