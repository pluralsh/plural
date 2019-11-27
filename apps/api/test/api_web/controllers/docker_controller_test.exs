defmodule ApiWeb.DockerControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "#events/2" do
    test "It will publish a docker notification event", %{conn: conn} do
      path = Routes.docker_path(conn, :events)

      conn
      |> put_req_header("content-type", "application/vnd.docker.distribution.events.v1+json")
      |> post(path, %{
        events: [
          %{action: "push", target: %{repository: "repo", tag: "latest", digest: "sha"}}
        ]
      })
      |> json_response(200)
    end
  end
end