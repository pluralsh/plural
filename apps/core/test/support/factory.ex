defmodule Core.Factory do
  use ExMachina.Ecto, repo: Core.Repo
  alias Core.Schema

  def user_factory do
    %Schema.User{
      name: "Some user",
      email: sequence(:user, & "user-#{&1}@example.com"),
      account: build(:account)
    }
  end

  def publisher_factory do
    %Schema.Publisher{
      name: sequence(:publisher, & "publisher-#{&1}"),
      owner: build(:user)
    }
  end

  def account_factory do
    %Schema.Account{
      name: sequence(:account, & "account-#{&1}")
    }
  end

  def repository_factory do
    %Schema.Repository{
      name: sequence(:repository, &"repo-#{&1}"),
      publisher: build(:publisher)
    }
  end

  def chart_factory do
    %Schema.Chart{
      repository: build(:repository),
      name: sequence(:chart, & "chart-#{&1}"),
      latest_version: "0.1.0"
    }
  end

  def terraform_factory do
    %Schema.Terraform{
      repository: build(:repository),
      name: sequence(:terraform, &"tf-#{&1}"),
      latest_version: "0.1.0"
    }
  end

  def version_factory do
    %Schema.Version{
      chart: build(:chart),
      version: "0.1.0"
    }
  end

  def installation_factory do
    %Schema.Installation{
      repository: build(:repository),
      user: build(:user),
    }
  end

  def chart_installation_factory do
    %Schema.ChartInstallation{
      chart: build(:chart),
      version: build(:version),
      installation: build(:installation)
    }
  end

  def terraform_installation_factory do
    %Schema.TerraformInstallation{
      terraform: build(:terraform),
      installation: build(:installation)
    }
  end

  def persisted_token_factory do
    %Schema.PersistedToken{
      token: sequence(:token, &"token-#{&1}"),
      user: build(:user)
    }
  end

  def docker_repository_factory do
    %Schema.DockerRepository{
      name: sequence(:dkr_repo, &"dkr-#{&1}"),
      repository: build(:repository)
    }
  end

  def docker_image_factory do
    %Schema.DockerImage{
      tag: sequence(:dkr_img, &"image-#{&1}"),
      digest: "sha:98ae8321",
      docker_repository: build(:docker_repository)
    }
  end

  def license_token_factory do
    %Schema.LicenseToken{
      token: sequence(:license_token, &"license-#{&1}"),
      installation: build(:installation)
    }
  end

  def webhook_factory do
    %Schema.Webhook{
      url: sequence(:webhook, &"https://url-#{&1}.com"),
      secret: sequence(:webhook, &"secret-#{&1}"),
      user: build(:user)
    }
  end

  def recipe_factory do
    %Schema.Recipe{
      name: sequence(:recipe, &"recipe-#{&1}"),
      repository: build(:repository)
    }
  end

  def recipe_section_factory do
    %Schema.RecipeSection{
      recipe: build(:recipe),
      repository: build(:repository),
      index: 0
    }
  end

  def recipe_item_factory do
    %Schema.RecipeItem{
      recipe_section: build(:recipe_section)
    }
  end

  def resource_definition_factory do
    %Schema.ResourceDefinition{
      name: sequence(:resource_def, &"resource-definition-#{&1}"),
    }
  end

  def specification_factory do
    %Schema.ResourceDefinition.Specification{}
  end

  def integration_factory do
    %Schema.Integration{
      name: sequence(:integration, &"intg-#{&1}"),
      repository: build(:repository)
    }
  end

  def tag_factory do
    %Schema.Tag{
      tag: sequence(:tags, &"tag-#{&1}"),
      resource_type: :integration
    }
  end

  def plan_factory do
    %Schema.Plan{
      name: sequence(:plan, &"plan-#{&1}"),
      repository: build(:repository),
      cost: 100
    }
  end

  def subscription_factory do
    %Schema.Subscription{
      installation: build(:installation),
      plan: build(:plan)
    }
  end

  def recipe_dependency_factory do
    %Schema.RecipeDependency{
      recipe: build(:recipe),
      dependent_recipe: build(:recipe)
    }
  end

  def version_tag_factory do
    %Schema.VersionTag{
      version: build(:version),
      chart: build(:chart),
      tag: sequence(:vt, &"tag-#{&1}")
    }
  end
end