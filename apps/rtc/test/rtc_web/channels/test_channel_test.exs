defmodule RtcWeb.TestChannelTest do
  use RtcWeb.ChannelCase, async: false

  describe "stdo" do
    test "it will broadcast a log line to all clients" do
      user = insert(:user)
      test = insert(:test, creator: user)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "tests:#{test.id}", %{})

      push(socket, "stdo", %{"line" => "logz", "step" => "id"})
      assert_broadcast "stdo", %{line: line, step: id}

      assert line == "logz"
      assert id == "id"
    end

    test "non-creators cannot publish logs" do
      user = insert(:user)
      test = insert(:test)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "tests:#{test.id}", %{})

      push(socket, "stdo", %{"line" => "logz", "step" => "id"})
      refute_broadcast "stdo", %{line: _, step: _}
    end
  end
end
