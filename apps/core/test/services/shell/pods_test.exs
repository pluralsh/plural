defmodule Core.Shell.PodsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Shell.Pods

  describe "#pod/2" do
    test "it can create a pod for a user" do
      pod = Pods.pod("plrl-shell-1", "mjg@plural.sh")

      refute pod.spec.runtime_class_name
    end

    test "a whitelisted user gets the sysbox class" do
      pod = Pods.pod("plrl-shell-1", "sysbox@plural.sh")

      assert pod.spec.runtime_class_name == "sysbox"
    end
  end
end
