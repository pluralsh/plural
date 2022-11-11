defmodule Core.Services.ScanTest do
  use Core.SchemaCase, async: true
  use Mimic

  alias Core.Services.Scan

  describe "#scan_image/1" do
    test "it can execute a trivy command" do
      image = insert(:docker_image)
      image_name = "dkr.plural.sh/#{image.docker_repository.repository.name}/#{image.docker_repository.name}:#{image.tag}"
      vuln = Application.get_env(:core, :vulnerability)
      expect(System, :cmd, fn
        "trivy", ["--quiet", "image", "--format", "json", ^image_name, "--timeout", "5m0s"], [env: [{"TRIVY_REGISTRY_TOKEN", _}]] ->
          {~s([{"Vulnerabilities": [#{vuln}]}]), 0}
      end)

      {:ok, scanned} = Scan.scan_image(image)

      assert scanned.id == image.id
      assert scanned.grade == :c
      assert scanned.scan_completed_at

      [vuln] = scanned.vulnerabilities
      assert vuln.image_id == scanned.id
    end

    test "it will mark on timeouts" do
      image = insert(:docker_image)
      expect(System, :cmd, fn
        "trivy", ["--quiet", "image", "--format", "json", _, "--timeout", "5m0s"], [env: [{"TRIVY_REGISTRY_TOKEN", _}]] ->
          {~s(image scan error: scan error: image scan failed: failed analysis: analyze error: timeout: context deadline exceeded), 1}
      end)

      {:ok, errored} = Scan.scan_image(image)

      assert errored.id == image.id
      assert errored.scan_completed_at
    end
  end

  describe "terrascan/2" do
    test "it can scan a terraform version" do
      result = terrascan_res()
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

      {:ok, scanned} = Scan.terrascan(version)

      assert scanned.grade == :d
    end

    test "it can scan a chart version" do
      result = terrascan_res()
      version = insert(:version, chart: insert(:chart))
      url = "http://chartmuseum:8080/cm/#{version.chart.repository.name}/charts/#{version.chart.name}-#{version.version}.tgz"
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

      {:ok, scanned} = Scan.terrascan(version)

      assert scanned.grade == :d
    end
  end

  defp terrascan_res(), do: priv_file(:core, "scan.json") |> File.read!()
end
