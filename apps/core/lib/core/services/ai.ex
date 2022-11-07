defmodule Core.Services.AI do
  alias Core.Clients.OpenAI

  @type error :: {:error, term}

  @doc """
  Generates an answer to a given prompt/question using gpt-3

  TODO: begin tuning our own models and have tools to select against those.
  TODO: add context to the query
  """
  @spec answer(binary) :: {:ok, binary} | error
  def answer(prompt) do
    case OpenAI.completion("davinci", prompt) do
      {:ok, %OpenAI.CompletionResponse{choices: [%OpenAI.Choice{text: text} | _]}} -> {:ok, text}
      {:ok, _} -> {:error, "no response found"}
      error -> error
    end
  end
end
