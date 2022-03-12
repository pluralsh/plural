defmodule Core.Services.ScaffoldsTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Scaffolds

  describe "#tf providers" do
    test "it retrieves all available tf providers" do
      assert :aws in Scaffolds.available_providers()
    end

    test "it retrieves definition for a given provider" do
      %{:name => name, :content => content} = Scaffolds.provider(:aws)
      assert name == :aws
      assert String.length(content) > 10
    end

    test "all available providers have definitions" do
      Scaffolds.available_providers()
      |> Enum.map(&Scaffolds.provider/1)
    end
  end

  describe "#quote_if_necessary/1" do
    test "strings w/o spaces are not quoted" do
      assert Scaffolds.quote_if_necessary("plural") == "plural"
    end

    test "strings w/ spaces are quoted" do
      assert Scaffolds.quote_if_necessary("Alexander Thamm") == ~w("Alexander Thamm")
    end
  end
end
