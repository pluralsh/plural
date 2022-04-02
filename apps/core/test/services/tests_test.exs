defmodule Core.Services.TestsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Tests
  alias Core.PubSub

  describe "#create_test/3" do
    setup [:setup_root_user]

    test "users that can edit a repository can create tests", %{user: user, account: account} do
      repo = insert(:repository, publisher: build(:publisher, account: account))
      inst = insert(:installation, user: user, repository: repo)
      chart = insert(:chart, repository: repo)
      tf = insert(:terraform, repository: repo)
      ci = insert(:chart_installation, chart: chart, installation: inst, version: build(:version, chart: chart))
      ti = insert(:terraform_installation, terraform: tf, installation: inst, version: build(:version, terraform: tf, chart_id: nil, chart: nil))

      {:ok, test} = Tests.create_test(%{
        steps: [%{name: "validate", description: "ensures the package is valid", status: :queued}],
        status: :queued,
        promote_tag: "warm",
      }, repo.id, user)

      assert test.status == :queued
      assert test.creator_id == user.id
      assert test.repository_id == repo.id

      %{bindings: bindings, steps: [step]} = test
      assert Enum.map(bindings, & &1.version_id) |>
             ids_equal(Enum.map([ti, ci], & &1.version_id))

      assert step.name == "validate"
      assert step.description == "ensures the package is valid"
      assert step.status == :queued

      assert_receive {:event, %PubSub.TestCreated{item: ^test}}
    end

    test "random users cannot create tests" do
      user = insert(:user)
      repo = insert(:repository)
      inst = insert(:installation, user: user, repository: repo)
      chart = insert(:chart, repository: repo)
      tf = insert(:terraform, repository: repo)
      insert(:chart_installation, chart: chart, installation: inst, version: build(:version, chart: chart))
      insert(:terraform_installation, terraform: tf, installation: inst, version: build(:version, terraform: tf, chart_id: nil, chart: nil))

      {:error, _} = Tests.create_test(%{
        steps: [%{name: "validate", description: "ensures the package is valid", status: :queued}],
        status: :queued,
        promote_tag: "warm",
      }, repo.id, user)
    end
  end

  describe "#update_test/3" do
    test "a test creator can update tests" do
      test = insert(:test)

      {:ok, updated} = Tests.update_test(%{status: :succeeded}, test.id, test.creator)

      assert updated.status == :succeeded

      assert_receive {:event, %PubSub.TestUpdated{item: ^updated}}
    end

    test "random users cannot update tests" do
      test = insert(:test)
      {:error, _} = Tests.update_test(%{status: :succeeded}, test.id, insert(:user))
    end
  end
end
