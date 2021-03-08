defmodule RtcWeb.IncidentChannel do
  use RtcWeb, :channel
  alias Rtc.Presence
  alias Core.Services.Incidents

  def join("incidents:" <> id, _params, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :incident_id, id)}
  end

  def handle_info(:after_join, socket) do
    with {:ok, _} <- authorize(socket.assigns.incident_id, socket.assigns.user) do
      {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
        online_at: "#{System.system_time(:second)}"
      })

      push(socket, "presence_state", Presence.list(socket))
      {:noreply, socket}
    else
      _ -> {:stop, {:shutdown, :unauthorized}, socket}
    end
  end

  def handle_in("typing", _, socket) do
    broadcast!(socket, "typing", %{name: socket.assigns.user.name})
    {:noreply, socket}
  end

  defp authorize(id, user) do
    with %{} = incident <- Incidents.get_incident(id),
      do: Core.Policies.Incidents.allow(incident, user, :access)
  end
end
