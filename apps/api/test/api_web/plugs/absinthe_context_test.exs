defmodule ApiWeb.Plugs.AbsintheContextTest do
  use ApiWeb.ConnCase, async: true
  alias ApiWeb.Plugs.AbsintheContext

  describe "origin" do
    test "it can add to absinthe context", %{conn: conn} do
      %{private: %{absinthe: %{context: ctx}}} =
        put_req_header(conn, "origin", "https://app.plural.sh")
        |> AbsintheContext.call([])

      assert ctx.origin == "https://app.plural.sh"
    end
  end
end
