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

  defmodule ContextResponse do
    @type t :: %__MODULE__{answer: binary}

    defstruct [:answer]
  end

  defmodule CompletionResponse do
    alias Core.Clients.OpenAI

    @type t :: %__MODULE__{choices: [OpenAI.Choice.t]}

    defstruct [:id, :object, :model, :choices]

    def spec(), do: %__MODULE__{choices: [OpenAI.Choice.spec()]}
  end

  @type error :: {:error, term}
  @type completion_resp :: {:ok, CompletionResponse.t} | error

  @doc """
  It will fetch a openai context blob from our internal docs index
  """
  @spec context(binary) :: {:ok, ContextResponse.t} | error
  def context(prompt) do
    body = Jason.encode!(%{question: prompt})

    context_url("/chat")
    |> HTTPoison.post(body, [{"Content-Type", "application/json"}], @options)
    |> case do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} -> Poison.decode(body, as: %ContextResponse{})
      _error -> {:error, :no_context}
    end
  end

  @doc """
  it will generate a chat from
  """
  @spec chat(binary, [Message.t]) :: completion_resp
  def chat(model \\ "gpt-3.5-turbo", history) do
    body = Jason.encode!(%{
      model: model,
      messages: history,
    })

    url("/chat/completions")
    |> HTTPoison.post(body, json_headers(), @options)
    |> handle_response(CompletionResponse.spec())
  end

  @spec completion(binary, binary) :: completion_resp
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

  defp context_url(path), do: "http://plural-ai:8000#{path}"

  defp json_headers(), do: headers([{"Content-Type", "application/json"}])

  defp headers(headers), do: [{"Authorization", "Bearer #{token()}"} | headers]

  defp token(), do: Core.conf(:openai_token)
end
