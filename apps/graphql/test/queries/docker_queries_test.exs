defmodule GraphQl.DockerQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "dockerRepositories" do
    test "It can list docker repositories for a repo" do
      repo = insert(:repository)
      docker_repos = insert_list(3, :docker_repository, repository: repo)

      {:ok, %{data: %{"dockerRepositories" => found}}} = run_query("""
        query DockerRepositories($id: ID!) {
          dockerRepositories(repositoryId: $id, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(docker_repos)
    end
  end

  describe "dockerImages" do
    test "it can list images for a docker repository" do
      repo = insert(:docker_repository)
      docker_imgs = insert_list(3, :docker_image, docker_repository: repo)

      {:ok, %{data: %{"dockerImages" => found}}} = run_query("""
        query DockerImages($id: ID!) {
          dockerImages(dockerRepositoryId: $id, first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      """, %{"id" => repo.id}, %{current_user: insert(:user)})

      assert from_connection(found)
             |> ids_equal(docker_imgs)
    end
  end

  describe "dockerImage" do
    test "it can fetch an individual image" do
      img = insert(:docker_image)
      vuln = insert(:vulnerability, image: img)

      {:ok, %{data: %{"dockerImage" => %{"vulnerabilities" => [vuln_found]} = found}}} = run_query("""
        query Docker($id: ID!) {
          dockerImage(id: $id) {
            id
            tag
            vulnerabilities { id vulnerabilityId }
          }
        }
      """, %{"id" => img.id}, %{current_user: insert(:user)})

      assert found["id"] == img.id
      assert found["tag"] == img.tag
      assert vuln_found["id"] == vuln.id
      assert vuln_found["vulnerabilityId"] == vuln.vulnerability_id
    end
  end
end
