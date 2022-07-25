defmodule Api do
  @moduledoc """
  Api keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  def hmac(secret, payload) do
    :crypto.hmac(:sha256, secret, payload)
    |> Base.encode16(case: :lower)
  end

  def gql_endpoint(), do: Core.url("/gql")

  def socket_endpoint(), do: "wss://#{Core.conf(:hostname)}/socket"
end
