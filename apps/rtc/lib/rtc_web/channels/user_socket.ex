defmodule RtcWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket,
    schema: GraphQl

  ## Channels
  channel "incidents:*", RtcWeb.IncidentChannel
  channel "upgrades:*", RtcWeb.UpgradeChannel

  @impl true
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
         {:ok, current_user, _claims} = resource_from_token(token) do
      {:ok, %{current_user: current_user}}
    end
  end

  def fetch_token(%{"Authorization" => token}), do: {:ok, token}
  def fetch_token(%{"token" => token}), do: {:ok, token}
  def fetch_token(_), do: {:error, :notoken}

  defp resource_from_token("cmt" <> _ = token) do
    with %{} = persisted <- Core.Services.Users.get_persisted_token(token),
         %{user: user}   <- Core.Repo.preload(persisted, [:user]) do
      {:ok, user, %{}}
    else
      _ -> {:error, :unauthorized}
    end
  end

  defp resource_from_token("Bearer " <> token), do: Core.Guardian.resource_from_token(token)

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     RtcWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(_socket), do: nil
end
