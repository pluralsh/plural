defmodule Core.Clients.OpenAI do
  require Logger

  @options [recv_timeout: :infinity, timeout: :infinity]

  defmodule Message do
    @type t :: %__MODULE__{}

    defstruct [:role, :content, :name]
  end

  defmodule Choice do
    alias Core.Clients.OpenAI

    @type t :: %__MODULE__{message: OpenAI.Message.t}

    defstruct [:text, :index, :logprobs, :message]

    def spec(), do: %__MODULE__{message: %OpenAI.Message{}}
  end

  defmodule CompletionResponse do
    alias Core.Clients.OpenAI

    @type t :: %__MODULE__{choices: [OpenAI.Choice.t]}

    defstruct [:id, :object, :model, :choices]

    def spec(), do: %__MODULE__{choices: [OpenAI.Choice.spec()]}
  end

  def chat(model \\ "gpt-3.5-turbo", history) do
    body = Jason.encode!(%{
      model: model,
      messages: history,
    })

    url("/chat/completions")
    |> HTTPoison.post(body, json_headers(), @options)
    |> handle_response(CompletionResponse.spec())
  end

  def completion(model, prompt) do
    body = Jason.encode!(%{
      model: model,
      prompt: String.trim(prompt),
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
    })

    url("/completions")
    |> HTTPoison.post(body, json_headers(), @options)
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

  defp token(), do: Core.conf(:openai_token)
end
