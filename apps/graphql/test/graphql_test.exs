defmodule GraphqlTest do
  use ExUnit.Case
  doctest Graphql

  test "greets the world" do
    assert Graphql.hello() == :world
  end
end
