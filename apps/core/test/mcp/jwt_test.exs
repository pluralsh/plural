defmodule Core.MCP.JwtTest do
  use Core.SchemaCase, async: true
  alias Core.MCP.Jwt

  describe "exchange/1" do
    @tag :skip
    test "it can exchange a jwt for a user" do
      Application.put_env(:core, :console_url, "https://console.boot-aws.onplural.sh")
      token = System.get_env("MCP_TEST_TOKEN")

      {:ok, claims} = Jwt.exchange(token)

      assert claims["sub"]
      assert claims["email"]
      assert claims["name"]
      refute Enum.empty?(claims["groups"])
    end
  end
end
