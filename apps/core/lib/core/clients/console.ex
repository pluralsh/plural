defmodule Core.Clients.Console do
  require Logger

  @clusters_q """
  query {
    clusters(first: 100) {
      edges { node { name id distro metadata } }
    }
  }
  """

  @create_svc_q """
  mutation Create($clusterId: ID!, $attributes: ServiceDeploymentAttributes!) {
    createServiceDeployment(clusterId: $clusterId, attributes: $attributes) {
      id
    }
  }
  """

  @delete_svc_q """
  mutation Delete($id: ID!) {
    deleteServiceDeployment(id: $id) {
      id
    }
  }
  """

  @update_svc_q """
  mutation Update($id: ID!, $attributes: ServiceUpdateAttributes!) {
    updateServiceDeployment(id: $id) {
      id
    }
  }
  """

  @repo_q """
  query Repo($url: String!) {
    gitRepository(url: $url) {
      id
    }
  }
  """

  def new(url, token) do
    Req.new(base_url: url, auth: "Token #{token}")
    |> AbsintheClient.attach()
  end

  def clusters(client) do
    Req.post(client, graphql: @clusters_q)
    |> case do
      {:ok, %Req.Response{body: %{"clusters" => %{"edges" => edges}}}} -> {:ok, Enum.map(edges, & &1["node"])}
      res ->
        Logger.warn "Failed to fetch clusters: #{inspect(res)}"
        {:error, "could not fetch clusters"}
    end
  end

  def repo(client, url) do
    Req.post(client, graphql: {@repo_q, %{url: url}})
    |> case do
      {:ok, %Req.Response{body: %{"gitRepository" => %{"id" => id}}}} -> {:ok, id}
      res ->
        Logger.warn "Failed to fetch clusters: #{inspect(res)}"
        {:error, "could not fetch repo"}
    end
  end

  def create_service(client, cluster_id, attrs) do
    Req.post(client, graphql: {@create_svc_q, %{clusterId: cluster_id, attributes: attrs}})
    |> service_resp("createServiceDeployment")
  end

  def update_service(client, id, attrs) do
    Req.post(client, graphql: {@update_svc_q, %{id: id, attributes: attrs}})
    |> service_resp("updateServiceDeployment")
  end

  def delete_service(client, id) do
    Req.post(client, graphql: {@delete_svc_q, %{id: id}})
    |> service_resp("deleteServiceDeployment")
  end

  defp service_resp({:ok, %Req.Response{status: 200, body: body}}, field) do
    case body[field] do
      %{"id" => id} -> {:ok, id}
      err ->
        Logger.warn "invalid console gql response: #{inspect(err)}"
    end
  end

  defp service_resp(resp, _) do
    Logger.error "failed to fetch from console: #{inspect(resp)}"
    {:error, "console error"}
  end
end
