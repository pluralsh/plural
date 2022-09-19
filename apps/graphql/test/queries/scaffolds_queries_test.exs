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

    test "it can't find provider definition for version x" do
      provider = "AWS"
      vsn = "0.1.1"
      {:ok, %{data: %{"terraformProvider" => %{"content" => message}}}} = run_query("""
        query Provider($name: Provider!, $vsn: string!) {
          terraformProvider(name: $name, vsn: $vsn) {
              name
              content
            }
        }
      """, %{"name" => provider, "vsn" => vsn})
      assert message == "could not find version #{vsn} for the given provider #{String.downcase(provider)}"
    end
  end
end
