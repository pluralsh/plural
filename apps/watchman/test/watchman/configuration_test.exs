defmodule Watchman.ConfigurationTest do
  use ExUnit.Case

  describe "#run/0" do
    test "It will cp ssh keys" do
      :ok = Watchman.Configuration.run()
    end
  end
end