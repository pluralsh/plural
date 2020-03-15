defmodule WatchmanWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket,
    schema: Watchman.GraphQl

  def connect(params, socket) do
    case build_context(params) do
      {:ok, context} ->
        socket = assign(socket, :user_id, context.current_user.id)
        socket = assign(socket, :user, context.current_user)
        {:ok, Absinthe.Phoenix.Socket.put_options(socket, context: context)}
      _ -> {:error, :unauthorized}
    end
  end

  def build_context(params) do
    with {:ok, token} <- fetch_token(params),
          {:ok, current_user, _claims} = Watchman.Guardian.resource_from_token(token) do
      {:ok, %{current_user: current_user}}
    end
  end

  def fetch_token(%{"Authorization" => "Bearer " <> token}), do: {:ok, token}
  def fetch_token(%{"token" => "Bearer " <> token}), do: {:ok, token}
  def fetch_token(_), do: {:error, :notoken}

  def id(_socket), do: nil
end
