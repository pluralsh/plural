defmodule Core.Shell.PodsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Shell.Pods
  alias Kazan.Apis.Core.V1, as: CoreV1

  describe "#pod/2" do
    test "it can create a pod for a user" do
      pod = Pods.pod("plrl-shell-1", "mjg@plural.sh")

      refute pod.spec.runtime_class_name
      assert pod.spec.node_selector["platform.plural.sh/instance-class"] == "shell"

      [toleration] = pod.spec.tolerations
      assert toleration.key == "platform.plural.sh/taint"
      assert toleration.value == "SHELL"
    end

    test "a whitelisted user gets the sysbox class" do
      %{spec: %{volumes: [volume]}} = pod = Pods.pod("plrl-shell-1", "sysbox@plural.sh")

      assert pod.spec.runtime_class_name == "sysbox-runc"
      assert pod.spec.node_selector["sysbox-runtime"] == "running"

      assert volume.name == "docker"
      assert volume.empty_dir == %CoreV1.EmptyDirVolumeSource{}

      [toleration] = pod.spec.tolerations
      assert toleration.key == "plural.sh/sysbox"
      assert toleration.value == "true"

      [shell, %{volume_mounts: [vm]} = dind] = pod.spec.containers

      assert shell.name == "shell"
      assert shell.image == "gcr.io/pluralsh/plural-cli-cloud:0.6.23"
      assert Enum.any?(shell.env, & &1.name == "DOCKER_HOST" && &1.value == "tcp://localhost:2375")

      assert dind.name == "dind"
      assert dind.image == "ghcr.io/pluralsh/plural-dind:pr-428"

      assert vm.name == "docker"
      assert vm.mount_path == "/var/lib/docker"
    end
  end
end
