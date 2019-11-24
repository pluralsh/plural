defmodule Core.Factory do
  use ExMachina.Ecto, repo: Core.Repo
  alias Core.Schema

  def user_factory do
    %Schema.User{
      name: "Some user",
      email: sequence(:user, & "user-#{&1}@example.com")
    }
  end

  def publisher_factory do
    %Schema.Publisher{
      name: sequence(:publisher, & "publisher-#{&1}"),
      owner: build(:user)
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
      name: sequence(:terraform, &"tf-#{&1}")
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
end