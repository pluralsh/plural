defmodule Core.Services.TerraformTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Terraform

  describe "#create_terraform/3" do
    test "A publisher can create tf repos" do
      %{owner: user} = pub = insert(:publisher)
      repo = insert(:repository, publisher: pub)

      {:ok, tf} = Terraform.create_terraform(%{name: "gcp"}, repo.id, user)

      assert tf.name == "gcp"
      assert tf.repository_id == repo.id
    end

    test "Non-publishers cannot create" do
      user = insert(:user)
      repo = insert(:repository)

      {:error, _} = Terraform.create_terraform(%{name: "aws"}, repo.id, user)
    end
  end

  describe "#update_terraform/3" do
    test "A publisher can update tf repos" do
      %{repository: repo} = tf = insert(:terraform)

      {:ok, tf} = Terraform.update_terraform(%{name: "aws"}, tf.id, repo.publisher.owner)

      assert tf.name == "aws"
      assert tf.repository_id == repo.id
    end

    test "non publishers can update tf repos" do
      tf = insert(:terraform)

      {:error, _} = Terraform.update_terraform(%{name: "aws"}, tf.id, insert(:user))
    end
  end

  describe "#extract_tf_meta/3" do
    test "It can find a readme and var template" do
      path = Path.join(:code.priv_dir(:core), "gcp.tgz")

      {:ok, %{readme: readme, values_template: tmp}} = Terraform.extract_tf_meta(%{
        package: %{path: path, filename: path}
      })

      assert is_binary(readme)
      assert is_binary(tmp)
    end
  end
end