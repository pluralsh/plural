defmodule Core.Services.DependenciesTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Dependencies

  describe "#valid?/2" do
    test "If a user has all deps set, it will return true" do
      chart     = insert(:chart)
      terraform = insert(:terraform)
      user      = insert(:user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, user: user, repository: chart.repository)
      )
      insert(:terraform_installation,
        terraform: terraform,
        installation: insert(:installation, user: user, repository: terraform.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name}
      ]})

      assert Dependencies.valid?(terraform.dependencies, user)
    end

    test "If a dependency is missing it returns false" do
      chart     = insert(:chart)
      terraform = insert(:terraform)
      user      = insert(:user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, user: user, repository: chart.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name}
      ]})

      refute Dependencies.valid?(terraform.dependencies, user)
    end

    test "Empty dependencies return true" do
      terraform = insert(:terraform)
      user = insert(:user)

      assert Dependencies.valid?(terraform.dependencies, user)

      terraform = insert(:terraform, dependencies: %{dependencies: []})
      assert Dependencies.valid?(terraform.dependencies, user)
    end
  end

  describe "#validate/2" do
    test "It will find the missing dependency" do
      chart     = insert(:chart)
      terraform = insert(:terraform)
      user      = insert(:user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, user: user, repository: chart.repository)
      )

      tf = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name}
      ]})

      {:error, {:missing_dep, dep}} = Dependencies.validate(tf.dependencies, user)

      assert dep.type == :terraform
      assert dep.name == terraform.name
      assert dep.repo == terraform.repository.name
    end

    test "It will pass if all dependencies are satisfied" do
      chart     = insert(:chart)
      terraform = insert(:terraform)
      user      = insert(:user)
      insert(:chart_installation,
        chart: chart,
        installation: insert(:installation, user: user, repository: chart.repository)
      )
      insert(:terraform_installation,
        terraform: terraform,
        installation: insert(:installation, user: user, repository: terraform.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name}
      ]})

      assert Dependencies.validate(terraform.dependencies, user) == :pass
    end
  end
end