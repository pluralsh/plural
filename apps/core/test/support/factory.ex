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
end