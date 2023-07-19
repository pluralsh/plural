defmodule Core.Services.AI do
  alias Core.Clients.OpenAI
  alias Core.Clients.OpenAI.{
    Choice,
    CompletionResponse,
    Message,
    ContextResponse
  }

  @type error :: {:error, term}
  @type message_resp :: {:ok, Message.t} | error

  @doc """
  Queries the openai chat api and returns the top response
  """
  @spec chat([Message.t]) :: message_resp
  def chat(history) do
    Enum.reverse(history)
    |> add_context()
    |> OpenAI.chat()
    |> case do
      {:ok, %CompletionResponse{choices: [%Choice{message: %Message{} = message} | _]}} ->
        {:ok, message}
      {:ok, _} -> {:error, "no response found"}
      error -> error
    end
  end

  defp add_context([%{content: content} | _] = history) do
    OpenAI.context(content)
    |> case do
      {:ok, %ContextResponse{answer: answer}} ->
       [%{content: "here's some helpful context: #{answer}", role: "user"} | history]
      _ -> history
    end
    |> Enum.reverse()
  end
  defp add_context(hist), do: Enum.reverse(hist)

  @doc """
  Generates an answer to a given prompt/question using gpt-3

  TODO: begin tuning our own models and have tools to select against those.
  TODO: add context to the query
  """
  @spec answer(binary) :: {:ok, binary} | error
  def answer(prompt) do
    case OpenAI.completion("text-davinci-003", prompt) do
      {:ok, %CompletionResponse{choices: [%Choice{text: text} | _]}} -> {:ok, text}
      {:ok, _} -> {:error, "no response found"}
      error -> error
    end
  end
end
