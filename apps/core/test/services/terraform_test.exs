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

  describe "#upsert_terraform" do
    test "if no matching tf exists, it will create" do
      repository = insert(:repository)
      path = Path.join(:code.priv_dir(:core), "gcp-bootstrap.tgz")

      {:ok, args} = Terraform.extract_tf_meta(%{
        package: %{path: path, filename: path}
      })

      {:ok, tf} = Terraform.upsert_terraform(
        Map.merge(%{name: "upsert", description: "an upsert"}, args),
        repository.id,
        "upsert",
        repository.publisher.owner)

      assert tf.latest_version == "0.1.0"
      assert tf.description == "Creates a GKE cluster and prepares it for bootstrapping"
      assert tf.dependencies.providers == [:gcp]
      assert Enum.empty?(tf.dependencies.dependencies)

      version = Terraform.get_latest_version(tf.id)
      assert version.version == "0.1.0"
      assert version.dependencies.providers == [:gcp]
      assert Enum.empty?(tf.dependencies.dependencies)
    end

    test "It will update if the tf exists" do
      repository = insert(:repository)
      terraform  = insert(:terraform, name: "upsert", repository: repository)

      {:ok, tf} = Terraform.upsert_terraform(
        %{name: "upsert", description: "an upsert"},
        repository.id,
        "upsert",
        repository.publisher.owner)

      assert tf.id == terraform.id
      assert tf.description == "an upsert"
    end
  end

  describe "#delete_terraform/2" do
    test "A publisher can delete terraform" do
      %{publisher: pub} = repo = insert(:repository)
      terraform = insert(:terraform, repository: repo)

      {:ok, del} = Terraform.delete_terraform(terraform.id, pub.owner)

      assert del.id == terraform.id
      refute refetch(terraform)
    end

    test "Nonpublishers cannot delete tf" do
      terraform = insert(:terraform)
      {:error, _} = Terraform.delete_terraform(terraform.id, insert(:user))
    end
  end

  describe "#extract_tf_meta/3" do
    test "It can find a readme and var template" do
      path = Path.join(:code.priv_dir(:core), "gcp-bootstrap.tgz")

      {:ok, %{readme: readme, values_template: tmp, dependencies: deps, description: desc, latest_version: v}} = Terraform.extract_tf_meta(%{
        package: %{path: path, filename: path}
      })

      assert is_binary(readme)
      assert is_binary(tmp)
      assert is_binary(desc)
      assert is_binary(v)
      assert is_list(deps["dependencies"])
    end
  end


  describe "#create_terraform_installation" do
    test "A user can install terraform modules from repo's they've installed" do
      terraform = insert(:terraform)
      user = insert(:user)
      installation = insert(:installation, repository: terraform.repository, user: user)

      {:ok, ti} = Terraform.create_terraform_installation(%{
        terraform_id: terraform.id
      }, installation.id, user)

      assert ti.terraform_id == terraform.id
      assert ti.installation_id == installation.id
    end

    test "If there is no installation of the terraform's repo, it can't be installed" do
      terraform = insert(:terraform)
      user = insert(:user)
      installation = insert(:installation, user: user)

      {:error, _} = Terraform.create_terraform_installation(%{
        terraform_id: terraform.id
      }, installation.id, user)
    end

    test "If dependencies are met it can install" do
      chart = insert(:chart)
      tf    = insert(:terraform)
      user  = insert(:user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, user: user, repository: chart.repository)
      )
      insert(:terraform_installation,
        terraform: tf,
        installation: insert(:installation, user: user, repository: tf.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: tf.repository.name, name: tf.name}
      ]})
      installation = insert(:installation, repository: terraform.repository, user: user)

      {:ok, _} = Terraform.create_terraform_installation(%{
        terraform_id: terraform.id
      }, installation.id, user)
    end

    test "If dependencies aren't met it can't install" do
      chart = insert(:chart)
      tf    = insert(:terraform)
      user  = insert(:user)
      insert(:terraform_installation,
        terraform: tf,
        installation: insert(:installation, user: user, repository: tf.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: tf.repository.name, name: tf.name}
      ]})
      installation = insert(:installation, repository: terraform.repository, user: user)

      {:error, {:missing_dep, _}} = Terraform.create_terraform_installation(%{
        terraform_id: terraform.id
      }, installation.id, user)
    end
  end

  describe "#delete_chart_installation" do
    test "A user can delete his terraform installation" do
      terraform = insert(:terraform)
      user = insert(:user)
      installation = insert(:installation, repository: terraform.repository, user: user)
      ti = insert(:terraform_installation, terraform: terraform, installation: installation)

      {:ok, _} = Terraform.delete_terraform_installation(ti.id, user)

      refute refetch(ti)
    end

    test "A user cannot delete others' installations" do
      ti = insert(:terraform_installation)

      {:error, _} = Terraform.delete_terraform_installation(ti.id, insert(:user))
    end
  end
end