defmodule Core.Services.DependenciesTest do
  use Core.SchemaCase
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
        %{type: :helm, repo: chart.repository.name, name: chart.name, providers: [:gcp]},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name}
      ]})

      assert Dependencies.valid?(terraform.dependencies, user)
    end

    test "It can handle any dependencies" do
      chart     = insert(:chart)
      ignore    = insert(:chart, repository: chart.repository)
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
        %{type: :helm, repo: chart.repository.name, any: [chart.name, ignore.name]},
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

    test "It will validate dep versions" do
      chart     = insert(:chart)
      terraform = insert(:terraform)
      user      = insert(:user)
      insert(:chart_installation,
        chart: chart,
        version: insert(:version, chart: chart, version: "1.0.2"),
        installation: insert(:installation, user: user, repository: chart.repository)
      )
      insert(:terraform_installation,
        terraform: terraform,
        version: insert(:version, terraform: terraform, version: "0.2.2"),
        installation: insert(:installation, user: user, repository: terraform.repository)
      )

      terraform = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name, version: "~> 1.0"},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name, version: "~> 0.2"}
      ]})

      assert Dependencies.validate(terraform.dependencies, user) == :pass

      tf = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name, version: "~> 1.0"},
        %{type: :terraform, repo: terraform.repository.name, name: terraform.name, version: "~> 0.3"}
      ]})

      {:error, {:missing_dep, dep}} = Dependencies.validate(tf.dependencies, user)
      assert dep.name == terraform.name
    end
  end

  describe "#closure/1" do
    test "It can recursively traverse dependencies" do
      chart = insert(:chart)
      chart2 = insert(:chart)
      chart3 = insert(:chart)
      t1 = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart2.repository.name, name: chart2.name}
      ]})

      t2 = insert(:terraform, dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :helm, repo: chart3.repository.name, name: chart3.name},
        %{type: :terraform, repo: t1.repository.name, name: t1.name}
      ]})

      closure = Dependencies.closure(t2)

      assert ids_equal(closure, [chart, chart2, chart3, t1])
    end
  end
end