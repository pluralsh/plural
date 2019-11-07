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

  describe "#update_repository" do
    test "Users can update their repositories" do
      %{owner: user} = publisher = insert(:publisher)
      repo = insert(:repository, publisher: publisher)

      {:ok, updated} = Repositories.update_repository(%{name: "piazza"}, repo.id, user)

      assert updated.name == "piazza"
    end

    test "Nonpublishers cannot update their repositories" do
      user = insert(:user)
      repo = insert(:repository)

      {:error, _} = Repositories.update_repository(%{name: "piazza"}, repo.id, user)
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

  describe "update_installation" do
    test "Users can update their installations" do
      %{user: user} = inst = insert(:installation)

      {:ok, updated} = Repositories.update_installation(%{context: %{some: "value"}}, inst.id, user)

      assert updated.context.some == "value"
    end

    test "Other users cannot update" do
      user = insert(:user)
      inst = insert(:installation)

      {:error, _} = Repositories.update_installation(%{context: %{some: "val"}}, inst.id, user)
    end
  end

  describe "#delete_repository" do
    test "Publishers can delete repos" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, repo} = Repositories.delete_repository(repo.id, user)

      refute refetch(repo)
    end

    test "Non publishers cannot delete" do
      repo = insert(:repository)

      {:error, _} = Repositories.delete_repository(repo.id, insert(:user))
    end
  end
end