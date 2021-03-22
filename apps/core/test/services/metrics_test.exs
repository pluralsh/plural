defmodule Core.Services.MetricsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Metrics

  describe "#query_docker_pulls/1" do
    test "it can aggregate pulls for a repo" do
      Metrics.docker_pull("repo1", "tag1")
      Metrics.docker_pull("repo1", "tag2")
      Metrics.docker_pull("repo2", "tag")

      {:ok, result} = Metrics.query_docker_pulls("repo1")

      assert Enum.map(result, fn %{tags: %{tag: tag}} -> tag end)
             |> Enum.sort() == ["tag1", "tag2"]
    end
  end

  describe "#query_docker_pulls_for_tag/2" do
    test "it can aggregate pulls for a repo:tag" do
      Metrics.docker_pull("repo1", "tag1")
      Metrics.docker_pull("repo1", "tag2")
      Metrics.docker_pull("repo2", "tag")

      {:ok, [_]} = Metrics.query_docker_pulls_for_tag("repo1", "tag1")
    end
  end
end
