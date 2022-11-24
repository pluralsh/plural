defmodule GraphQl.AIQueriesTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  use Mimic

  describe "helpQuestion" do
    test "it will query gpt-3 for an answer" do
      resp = Jason.encode!(%{choices: [%{text: "a long answer to a short question"}]})
      expect(HTTPoison, :post, fn _, _, _, _ -> {:ok, %HTTPoison.Response{status_code: 200, body: resp}} end)

      {:ok, %{data: %{"helpQuestion" => result}}} = run_query("""
        query Q($prompt: String!) {
          helpQuestion(prompt: $prompt)
        }
      """, %{"prompt" => "huh"}, %{current_user: insert(:user)})

      assert result == "a long answer to a short question"
    end
  end
end
