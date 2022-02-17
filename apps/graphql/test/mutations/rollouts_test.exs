defmodule GraphQl.RolloutMutationsTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "unlockRepository" do
    test "it will unlock the module installations for a repository" do
      user = insert(:user)
      repo = insert(:repository)
      inst = insert(:installation, repository: repo, user: user)
      cl = insert(:chart_installation, installation: inst, locked: true, chart: insert(:chart, repository: repo))
      tl = insert(:terraform_installation, installation: inst, locked: true, terraform: insert(:terraform, repository: repo))

      ignore = insert(:chart_installation, locked: true, chart: cl.chart)

      {:ok, %{data: %{"unlockRepository" => unlock}}} = run_query("""
        mutation Unlock($name: String!) {
          unlockRepository(name: $name)
        }
      """, %{"name" => repo.name}, %{current_user: user})

      assert unlock == 2

      refute refetch(cl).locked
      refute refetch(tl).locked

      assert refetch(ignore).locked
    end
  end
end
