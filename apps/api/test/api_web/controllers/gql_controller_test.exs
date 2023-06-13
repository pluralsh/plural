defmodule ApiWeb.GqlControllerTest do
  use ApiWeb.ConnCase, async: true

  describe "POST /gql" do
    test "it can evaluated an authenticated gql document", %{conn: conn} do
      user = insert(:user)

      %{"data" => %{"me" => me}} =
        conn
        |> authorized(user)
        |> post("/gql", %{
          query: """
            query {
              me { id }
            }
          """,
          variables: %{}
        })
        |> json_response(200)

      assert me["id"] == user.id
    end
  end
end
