defmodule RtcWeb.ShellChannelTest do
  use RtcWeb.ChannelCase, async: false
  use Mimic
  alias Core.Services.Shell.Pods

  setup :set_mimic_global

  describe "ShellChannel" do
    test "users can connect to pods and send commands" do
      user = insert(:user)
      %{id: id} = cloud_shell = insert(:cloud_shell, user: user, pod_name: "plrl-shell")

      url = Pods.PodExec.exec_url(cloud_shell.pod_name)
      # expect(Client, :setup, fn %{id: ^id} -> {:ok, true} end)
      expect(Pods.PodExec, :start_link, fn ^url, _ -> {:ok, :pid} end)

      expect(Pods.PodExec, :command, fn :pid, cmd ->
        send self(), {:stdo, cmd}
      end)

      expect(Pods.PodExec, :resize, fn :pid, 1, 2 ->
        send self(), {:stdo, "resized"}
      end)

      {:ok, socket} = mk_socket(user)
      {:ok, _, socket} = subscribe_and_join(socket, "shells:me", %{})

      ref = push(socket, "command", %{"cmd" => "echo 'hello world'"})
      assert_reply ref, :ok, _
      assert_push "stdo", %{message: res}

      assert Base.decode64!(res) == "echo 'hello world'"

      ref = push(socket, "resize", %{"width" => 1, "height" => 2})
      assert_reply ref, :ok, _
      assert_push "stdo", %{message: res}

      assert Base.decode64!(res) == "resized"
    end
  end
end
