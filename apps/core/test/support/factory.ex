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

  def chart_factory do
    %Schema.Chart{
      publisher: build(:publisher),
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
      chart: build(:chart),
      user: build(:user),
      version: "0.1.0"
    }
  end
end