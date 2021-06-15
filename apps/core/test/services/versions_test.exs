defmodule Core.Services.VersionsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Versions
  alias Core.PubSub

  describe "#create_version" do
    test "A user can create new versions of charts he owns" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)

      {:ok, version} = Versions.create_version(%{version: "1.1.0"}, :helm, chart.id, user)

      assert version.chart_id == chart.id
      assert version.version == "1.1.0"

      assert refetch(chart).latest_version == "1.1.0"
      %{tags: [tag]} = Core.Repo.preload(version, [:tags])
      assert tag.tag == "latest"
      assert tag.chart_id == chart.id
    end

    test "Non owners are forbidden" do
      user = insert(:user)
      chart = insert(:chart)

      {:error, _} = Versions.create_version(%{version: "1.0.0"}, :helm, chart.id, user)
    end
  end

  describe "#update_version" do
    test "A publisher can update version tags" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart, version: "1.1.0")

      {:ok, %{id: id, tags: [tag]} = result} = Versions.update_version(%{tags: [%{tag: "stable"}]}, version.id, user)

      assert id == version.id
      assert tag.chart_id == chart.id
      assert tag.version_id == version.id
      assert tag.tag == "stable"

      assert_receive {:event, %PubSub.VersionUpdated{item: ^result, actor: ^user}}
    end

    test "It can update with existing tags" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)
      version = insert(:version, chart: chart, version: "1.1.0")
      insert(:version_tag, version: version, chart: chart, tag: "latest")
      insert(:version_tag, version: build(:version, chart: chart), chart: chart)

      {:ok, %{id: id, tags: tags} = result} = Versions.update_version(%{tags: [%{tag: "stable"}, %{tag: "latest"}]}, version.id, user)

      assert id == version.id

      assert length(tags) == 2
      assert Enum.all?(tags, & &1.chart_id == chart.id)
      assert Enum.all?(tags, & &1.version_id == version.id)
      assert Enum.map(tags, & &1.tag)
             |> Enum.sort() == ["latest", "stable"]

      assert_receive {:event, %PubSub.VersionUpdated{item: ^result}}
    end
  end
end
