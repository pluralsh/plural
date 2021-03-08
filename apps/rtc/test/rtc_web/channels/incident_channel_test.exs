defmodule RtcWeb.IncidentChannelTest do
  use RtcWeb.ChannelCase, async: false

  describe "presence" do
    test "It will push new presence state" do
      user = insert(:user)
      incident = insert(:incident, creator: user)

      {:ok, socket} = mk_socket(user)
      {:ok, _, _} = subscribe_and_join(socket, "incidents:#{incident.id}", %{})

      assert_broadcast "presence_diff", %{joins: joins}
      assert joins[user.id]
    end
  end

  describe "typing" do
    test "it will broadcast the handle to all clients" do
      user = insert(:user)
      incident = insert(:incident, creator: user)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "incidents:#{incident.id}", %{})

      push(socket, "typing", %{"who" => "cares"})
      assert_broadcast "typing", %{name: name}

      assert name == user.name
    end
  end
end
