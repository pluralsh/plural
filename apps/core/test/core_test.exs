defmodule CoreTest do
  use ExUnit.Case
  doctest Core

  test "greets the world" do
    assert Core.hello() == :world
  end
end
