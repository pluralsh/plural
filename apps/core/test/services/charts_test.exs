defmodule Core.Services.ChartsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Charts

  describe "#create_chart" do
    test "A user can create a chart if he's a publisher" do
      user = insert(:user)
      pub  = insert(:publisher, owner: user)
      repo = insert(:repository, publisher: pub)

      {:ok, chart} = Charts.create_chart(%{name: "somechart", latest_version: "0.1.0"}, repo.id, user)

      assert chart.name == "somechart"
      assert chart.repository_id == repo.id
      assert chart.latest_version == "0.1.0"

      assert Charts.get_chart_version(chart.id, "0.1.0")
    end
  end

  describe "#create_version" do
    test "A user can create new versions of charts he owns" do
      user  = insert(:user)
      pub   = insert(:publisher, owner: user)
      repo  = insert(:repository, publisher: pub)
      chart = insert(:chart, repository: repo)

      {:ok, version} = Charts.create_version(%{version: "1.1.0"}, chart.id, user)

      assert version.chart_id == chart.id
      assert version.version == "1.1.0"

      assert refetch(chart).latest_version == "1.1.0"
    end

    test "Non owners are forbidden" do
      user = insert(:user)
      chart = insert(:chart)

      {:error, _} = Charts.create_version(%{version: "1.0.0"}, chart.id, user)
    end
  end

  describe "#create_chart_installation" do
    test "A user can install valid versions of a chart" do
      %{chart: chart, id: vid} = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, repository: chart.repository, user: user)

      {:ok, ci} = Charts.create_chart_installation(%{
        version_id: vid,
        chart_id: chart.id
      }, installation.id, user)

      assert ci.version_id == vid
      assert ci.chart_id == chart.id
      assert ci.installation_id == installation.id
    end

    test "If there is no installation of the chart's repo, it can't be installed" do
      %{chart: chart} = version = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, user: user)

      {:error, _} = Charts.create_chart_installation(%{
        version_id: version.id,
        chart_id: chart.id
      }, installation.id, user)
    end

    test "If the version is invalid, it can't be installed" do
      %{chart: chart} = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, repository: chart.repository, user: user)
      version = insert(:version)

      {:error, _} = Charts.create_chart_installation(%{
        version_id: version.id,
        chart_id: chart.id
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

      %{chart: chart, id: vid} = insert(:version, version: "1.0.0", dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: tf.repository.name, name: tf.name}
      ]})
      installation = insert(:installation, repository: chart.repository, user: user)

      {:ok, _} = Charts.create_chart_installation(%{
        version_id: vid,
        chart_id: chart.id
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

      %{chart: chart, id: vid} = insert(:version, version: "1.0.0", dependencies: %{dependencies: [
        %{type: :helm, repo: chart.repository.name, name: chart.name},
        %{type: :terraform, repo: tf.repository.name, name: tf.name}
      ]})
      installation = insert(:installation, repository: chart.repository, user: user)

      {:error, _} = Charts.create_chart_installation(%{
        version_id: vid,
        chart_id: chart.id
      }, installation.id, user)
    end
  end

  describe "#update_chart_installation" do
    test "A user can update his chart installation" do
      %{chart: chart} = v = insert(:version, version: "1.0.0")
      user = insert(:user)
      installation = insert(:installation, repository: chart.repository, user: user)
      chart_inst = insert(:chart_installation, installation: installation, chart: chart, version: v)
      v2 = insert(:version, chart: chart, version: "2.0")

      {:ok, ci} = Charts.update_chart_installation(%{
        version_id: v2.id
      }, chart_inst.id, user)

      assert ci.id == chart_inst.id
      assert ci.version_id == v2.id
    end
  end

  describe "#sync_version" do
    test "It will add helm info onto a chart version" do
      version = insert(:version)

      {:ok, version} = Charts.sync_version(
        %{helm: %{"description" => "some chart"}},
        version.chart_id,
        version.version
      )

      assert version.helm == %{"description" => "some chart"}
    end
  end

  describe "#extract_chart_meta/2" do
    test "It can extract info from a tar file" do
      path = Path.join(:code.priv_dir(:core), "chartmart-0.2.3.tgz")
      {:ok, %{readme: _, helm: _, values_template: template}} = Charts.extract_chart_meta("chartmart", path)

      assert is_binary(template)
    end
  end
end