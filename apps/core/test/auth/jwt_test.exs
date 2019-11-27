defmodule Core.Auth.JwtTest do
  use Core.SchemaCase, async: true
  alias Core.Auth.Jwt

  @cert """
-----BEGIN CERTIFICATE-----
MIIC9DCCAdygAwIBAgIQXeJphV6fLJ+XjiltMQKtIDANBgkqhkiG9w0BAQsFADAU
MRIwEAYDVQQDEwljaGFydG1hcnQwHhcNMTkxMTI2MDI1NTEwWhcNMjUwMTI0MDI1
NTEwWjAUMRIwEAYDVQQDEwljaGFydG1hcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IB
DwAwggEKAoIBAQDfbXpgMWSZQYxjShBDnyh9erTc6b6WzVcOy/P6joICTQci2qkx
k8b54giIaJ4QJoe6N+ZsrXFeGkx3eNWpF03wW+zyMbcLhK0oz39i8SAjPiSOBbV6
HYCKSyIIJeiR/ZHuCa91T4Jk8aeBnJ2Iq9XTK1CXXkctkfztMVOrdoC4QnAeJfg1
W+/0gUBpfpmRQatJGILqJDxu0YwkHDiD+d6iK7ncOkr6vKkzRcGBe95d7ekCOXB7
jaWSMJzcjmhS1tPdexmuq/N4Zf/7C3S4usvl7ij26A89Na0ckY0AtEjrzmLc6AjU
HFB7sUMvJy/j32v9kMlLhYASqtjwOE1uaWgbAgMBAAGjQjBAMA4GA1UdDwEB/wQE
AwICpDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDwYDVR0TAQH/BAUw
AwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAspZ5N2by6FJruiWiVdxIze++B/0rHlHM
uVbDFW8tYabJnm8B8BlG4MIcMsZzLHmi4fZJEaaeXXwuB1svWicO/0hfYkcf89JF
4Op7QeEUWvOBcXx5omP2s4HRsCSaRv3bJd7xYE10dhxCymToAj8UPbWGTxsbMd4y
NH9U9X+NfsM4Lbrhvk7CQ3GsaEMqbwL7StnLrSOvDCUdtLAosMUzTMLuNXzt7tyX
M66fmwmaxu7bfyuzxK6se+fIfZo2aDyQPydnIwjxXcbzjYcTms18rB6gCAKo+Ih6
1IRqyWiZ9BPhqohoDaa/+h0tuH4jdCsOdzfil1IViZRNcdYjpKzbaA==
-----END CERTIFICATE-----
"""

  describe "invertability" do
    test "Generated tokens can be validated and use the supplied config" do
      signer = Jwt.signer()
      {:ok, claims} = Jwt.generate_claims(%{})
      {:ok, token, _} = Jwt.encode_and_sign(claims, signer)

      {:ok, claims} = Jwt.verify(token, signer)

      assert claims["aud"] == "mart.piazzaapp.com"
      assert claims["iss"] == "mart.piazzaapp.com"

      {:ok, header} = Joken.peek_header(token)

      assert header["kid"]
      assert header["alg"] == "RS256"
    end
  end

  describe "#fingerprint/1" do
    test "It will generate correct docker-like fingerprints" do
      cert = X509.Certificate.from_pem!(@cert)
      assert Jwt.fingerprint(cert) == "VJRO:4E5L:7HVV:6QIR:NEYM:TX2M:V5Y5:CMPO:UGFJ:427P:XD2L:WB4E"
    end
  end
end