defmodule Core.Auth.Jwt do
  use Joken.Config

  def signer() do
    cert = X509.Certificate.from_pem!(conf(:cert))
    Joken.Signer.create("RS256", %{"pem" => conf(:pk)}, %{"kid" => fingerprint(cert)})
  end

  def fingerprint(certificate) do
    pk = X509.Certificate.public_key(certificate)
    der_encoded = X509.PublicKey.to_der(pk)

    :crypto.hash(:sha256, der_encoded)
    |> Base.encode32()
    |> String.to_charlist()
    |> Enum.chunk_every(4, 4, :discard)
    |> Enum.take(12)
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