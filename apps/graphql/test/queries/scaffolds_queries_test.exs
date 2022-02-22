defmodule GraphQl.ScaffoldsQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers

  describe "tf providers" do
    test "it can list all available tf providers" do
      {:ok, %{data: %{"terraformProviders" => found}}} = run_query("""
        query {
          terraformProviders
        }
      """, %{})
      assert "AWS" in found
    end

    test "it can retrieve provider definition" do
      aws = "AWS"
      {:ok, %{data: %{"terraformProvider" => %{"content" => content, "name" => name}}}} = run_query("""
        query Provider($name: Provider!) {
          terraformProvider(name: $name) {
              name
              content
            }
        }
      """, %{"name" => aws})
      assert String.length(content) > 10
      assert name == aws
    end
  end
end
