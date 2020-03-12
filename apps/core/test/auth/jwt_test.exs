defmodule Core.Auth.JwtTest do
  use Core.SchemaCase, async: true
  alias Core.Auth.Jwt

  describe "invertability" do
    test "Generated tokens can be validated and use the supplied config" do
      signer = Jwt.signer()
      {:ok, claims} = Jwt.generate_claims(%{})
      {:ok, token, _} = Jwt.encode_and_sign(claims, signer)

      {:ok, claims} = Jwt.verify(token, signer)

      assert claims["aud"] == "forge.piazza.app"
      assert claims["iss"] == "forge.piazza.app"

      {:ok, header} = Joken.peek_header(token)

      assert header["kid"] == "FEZY:NMGW:Y24M:5OWB:NK2T:6QMP:M2OQ:SDCI:G6X7:S7EG:S7VF:WFDP"
      assert header["alg"] == "RS256"
    end
  end
end