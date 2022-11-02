defmodule Core.Clients.OpenAI do
  require Logger

  defmodule Choice, do: defstruct [:text, :index, :logprobs]

  defmodule CompletionResponse do
    alias Core.Clients.OpenAI
    defstruct [:id, :object, :model, :choices]

    def spec(), do: %__MODULE__{choices: [%OpenAI.Choice{}]}
  end

  def completion(model, prompt) do
    body = Jason.encode!(%{
      model: model,
      prompt: prompt,
      max_tokens: 1000,
    })

    url("/completions")
    |> HTTPoison.post(body, json_headers())
    |> handle_response(CompletionResponse.spec())
  end

  defp handle_response({:ok, %HTTPoison.Response{status_code: code, body: body}}, type) when code in 200..299,
    do: {:ok, Poison.decode!(body, as: type)}
  defp handle_response(error, _) do
    Logger.error "Failed to call openai api: #{inspect(error)}"
    {:error, :openai_error}
  end

  defp url(path), do: "https://api.openai.com/v1#{path}"

  defp json_headers(), do: headers([{"Content-Type", "application/json"}])

  defp headers(headers \\ []), do: [{"Authorization", "Bearer #{token()}"} | headers]

  defp token(), do: Application.get_env(:openai, :token)
end
