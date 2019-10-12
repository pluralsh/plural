defmodule Core.Services.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Repositories

  describe "#create_repository" do
    test "It will create a repository for the user's publisher" do
      %{owner: user} = insert(:publisher)

      {:ok, repo} = Repositories.create_repository(%{name: "piazza"}, user)

      assert repo.name == "piazza"
    end
  end

  describe "#create_installation" do
    test "Users can install other repositories" do
      user = insert(:user)
      repo = insert(:repository)

      {:ok, installation} = Repositories.create_installation(%{}, repo.id, user)

      assert installation.user_id == user.id
      assert installation.repository_id == repo.id
    end
  end
end