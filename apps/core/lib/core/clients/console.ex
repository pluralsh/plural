defmodule Core.Clients.Console do
  require Logger

  @me_q """
  query {
    me { id }
  }
  """

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
    updateServiceDeployment(id: $id, attributes: $attributes) {
      id
    }
  }
  """

  @create_stack_q """
  mutation Create($attributes: StackAttributes!) {
    createStack(attributes: $attributes) {
      id
    }
  }
  """

  @update_stack_q """
  mutation update($id: ID!, $attributes: StackAttributes!) {
    updateStack(id: $id, attributes: $attributes) {
      id
    }
  }
  """

  @delete_stack_q """
  mutation delete($id: ID!) {
    deleteStack(id: $id) {
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

  @project_q """
  query Project($name: String!) {
    project(name: $name) { id }
  }
  """

  @stack_q """
  query Stack($id: ID!) {
    infrastructureStack(id: $id) {
      id
      status
      output {
        name
        value
      }
    }
  }
  """

  def queries(:me_q), do: @me_q
  def queries(:stack_q), do: @stack_q
  def queries(:stack_create), do: @create_stack_q
  def queries(:stack_delete), do: @delete_stack_q

  def new(url, token) do
    Req.new(base_url: with_gql(url), auth: "Token #{token}")
    |> AbsintheClient.attach()
  end

  def clusters(client) do
    Req.post(client, graphql: @clusters_q)
    |> case do
      {:ok, %Req.Response{body: %{"data" => %{"clusters" => %{"edges" => edges}}}}} ->
        {:ok, Enum.map(edges, & &1["node"])}
      res ->
        Logger.warn "Failed to fetch clusters: #{inspect(res)}"
        {:error, "could not fetch clusters"}
    end
  end

  def repo(client, url) do
    Req.post(client, graphql: {@repo_q, %{url: url}})
    |> service_resp("gitRepository")
  end

  def me(client) do
    Req.post(client, graphql: {@me_q, %{}})
    |> service_resp("me")
  end

  def project(client, name) do
    Req.post(client, graphql: {@project_q, %{name: name}})
    |> service_resp("project")
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
    |> ignore_not_found()
  end

  def create_stack(client, attrs) do
    Req.post(client, graphql: {@create_stack_q, %{attributes: attrs}})
    |> service_resp("createStack")
  end

  def update_stack(client, id, attrs) do
    Req.post(client, graphql: {@update_stack_q, %{id: id, attributes: attrs}})
    |> service_resp("updateStack")
  end

  def delete_stack(client, id) do
    Req.post(client, graphql: {@delete_stack_q, %{id: id}})
    |> service_resp("deleteStack")
    |> ignore_not_found()
  end

  def stack(client, id) do
    Req.post(client, graphql: {@stack_q, %{id: id}})
    |> case do
      {:ok, %Req.Response{body: %{"errors" => [_ | _] = errors}}} -> {:error, errors}
      {:ok, %Req.Response{body: %{"data" => %{"infrastructureStack" => stack}}}} ->
        {:ok, stack}
      res ->
        Logger.warn "Failed to fetch stack: #{inspect(res)}"
        {:error, "could not fetch stack"}
    end
  end

  defp ignore_not_found({:error, ["could not find resource" <> _ | _]}), do: {:ok, nil}
  defp ignore_not_found(pass), do: pass

  defp service_resp({:ok, %Req.Response{body: %{"errors" => [_ | _] = errors}}}, _), do: {:error, errors}
  defp service_resp({:ok, %Req.Response{status: 200, body: %{"data" => body}}}, field) do
    case body[field] do
      %{"id" => id} -> {:ok, id}
      err ->
        Logger.warn "invalid console gql response: #{inspect(err)}"
        {:error, "#{field} query failed"}
    end
  end

  defp service_resp(resp, _) do
    Logger.error "failed to fetch from console: #{inspect(resp)}"
    {:error, "console error"}
  end

  defp with_gql(url) do
    case String.ends_with?(url, "/gql") do
      true -> url
      _ -> "#{url}/gql"
    end
  end
end
