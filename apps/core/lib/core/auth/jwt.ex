defmodule Core.Auth.Jwt do
  use Joken.Config

  def signer() do
    cert = X509.Certificate.from_pem!(conf(:cert))
    Joken.Signer.create("RS256", %{"pem" => conf(:pk)}, %{"kid" => fingerprint(cert)})
  end

  defp fingerprint(certificate) do
    der_encoded = X509.Certificate.to_der(certificate)

    :crypto.hash(:sha, der_encoded)
    |> Base.encode16
    |> String.to_charlist
    |> Enum.chunk_every(2, 2, :discard)
    |> Enum.join(":")
  end

  def token_config do
    default_claims(
      iss: conf(:iss),
      aud: conf(:aud),
      default_exp: 60 * 60
    )
  end

  defp conf(key), do: Application.get_env(:core, :jwt)[key]
end