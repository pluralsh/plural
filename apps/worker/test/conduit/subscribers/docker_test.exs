defmodule Worker.Conduit.Subscribers.DockerTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Worker.Conduit.Subscribers.Docker

  describe "#scan_image/1" do
    test "it can execute a trivy command" do
      image = insert(:docker_image)
      image_name = "dkr.piazza.app/#{image.docker_repository.repository.name}/#{image.docker_repository.name}:#{image.tag}"
      vuln = Application.get_env(:core, :vulnerability)
      expect(System, :cmd, fn
        "trivy", ["--quiet", "image", "--format", "json", ^image_name], [env: [{"TRIVY_REGISTRY_TOKEN", _}]] ->
          {~s([{"Vulnerabilities": [#{vuln}]}]), 0}
      end)

      {:ok, scanned} = Docker.scan_image(image)

      assert scanned.id == image.id
      assert scanned.grade == :c
      assert scanned.scanned_at

      [vuln] = scanned.vulnerabilities
      assert vuln.image_id == scanned.id
    end
  end
end
