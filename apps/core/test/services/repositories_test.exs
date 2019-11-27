defmodule Core.Services.RepositoriesTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Repositories
  alias Piazza.Crypto.RSA

  describe "#create_repository" do
    test "It will create a repository for the user's publisher" do
      %{owner: user} = insert(:publisher)

      {:ok, repo} = Repositories.create_repository(%{name: "piazza"}, user)

      assert repo.name == "piazza"
      assert is_binary(repo.public_key)
      assert is_binary(repo.private_key)
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

  describe "#authorize_docker/2" do
    test "A repo owner can push/pull" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      allowed = Repositories.authorize_docker(repo.name, user)

      assert [:pull, :push] == Enum.sort(allowed)
    end

    test "An installer can pull" do
      repo = insert(:repository)
      %{user: user} = insert(:installation, repository: repo)

      [:pull] = Repositories.authorize_docker(repo.name, user)
    end

    test "Arbitrary users have no access" do
      repo = insert(:repository)

      [] = Repositories.authorize_docker(repo.name, insert(:user))
    end
  end

  describe "#generate_license/1" do
    test "It can generate an ecrypted license for an installation" do
      publisher = insert(:publisher)
      {:ok, repo} = Repositories.create_repository(%{name: "my repo"}, publisher.owner)

      installation = insert(:installation, repository: repo)

      {:ok, license} = Repositories.generate_license(installation)
      {:ok, decoded} = RSA.decrypt(license, ExPublicKey.loads!(repo.public_key))

      assert is_map(Jason.decode!(decoded))
    end
  end
end