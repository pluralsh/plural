defmodule Core.FirewallTest do
  use Core.SchemaCase, async: true

  describe "#check/1" do
    test "external addresses are fine" do
      :ok = Core.Firewall.check("google.com")
    end

    test "internal ips are blocked" do
      {:error, _} = Core.Firewall.check("10.0.1.124")
      {:error, _} = Core.Firewall.check("172.16.0.0")
      {:error, _} = Core.Firewall.check("192.168.0.0")
    end

    test "link local ips are blocked" do
      {:error, _} = Core.Firewall.check("169.254.0.0")
    end
  end
end
