defmodule Watchman.Services.ForgeTest do
  use Watchman.DataCase, async: true
  use Mimic
  alias Watchman.Services.Forge

  describe "update_configuration/2" do
    @tag :skip
    test "it can update configuration in a forge repo" do
      repo = "repo"
      expected_path = Path.join([Watchman.workspace(), repo, "helm", repo, "values.yaml"])
      expect(File, :write, fn ^expected_path, _ -> :ok end)

      {:ok, _} = Forge.update_configuration(repo, "updated: yaml")
    end

    @tag :skip
    test "It will fail on invalid yaml" do
      repo = "repo"
      {:error, _} = Forge.update_configuration(repo, "- key:")
    end
  end
end