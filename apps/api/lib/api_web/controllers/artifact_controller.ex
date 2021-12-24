defmodule ApiWeb.ArtifactController do
  use ApiWeb, :controller
  import ApiWeb.Plugs.ReverseProxy
  alias Core.Schema.{Artifact, Repository}
  alias Core.Services.Repositories

  def show(conn, %{"name" => name, "repository" => repo, "platform" => plat, "arch" => arch}) do
    with %Repository{id: id} <- Repositories.get_repository_by_name(repo),
         %Artifact{} = artifact <- Repositories.get_artifact(id, name, plat, arch) do
      url = Core.Storage.url({artifact.blob, artifact}, :original)
      execute_proxy(:get, url, conn)
    else
      nil -> {:error, :not_found}
    end
  end

  def show(conn, _) do
    resp(conn, 400, "You must specify both platform and arch")
  end
end
