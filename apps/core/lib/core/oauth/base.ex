defmodule Core.OAuth.Base do
  require Logger

  defmacro __using__(_) do
    quote do
      import Core.OAuth.Base
      import System, only: [get_env: 1]
      require Logger

      def authorize_url(client, params) do
        OAuth2.Strategy.AuthCode.authorize_url(client, params)
      end

      def get_token(client, params, headers) do
        client
        |> put_header("accept", "application/json")
        |> OAuth2.Strategy.AuthCode.get_token(params, headers)
      end

      defp host(), do: Application.get_env(:core, :host)

      defoverridable [get_token: 3]
    end
  end

  @compile {:inline, ok: 1}
  def ok(val), do: {:ok, val}

  def build_user(blob) do
    Logger.info "Found oauth user: #{inspect(blob)}"
    %{
      email: blob["email"],
      name: find_name(blob),
      avatar: blob["profile"]
    }
  end

  defp find_name(%{"name" => name}), do: name
  defp find_name(%{"firstName" => _ } = blob), do: "#{blob["firstName"]} #{blob["lastName"]}"
  defp find_name(_), do: nil
end
