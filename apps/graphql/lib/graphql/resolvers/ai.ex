defmodule GraphQl.Resolvers.AI do
  alias Core.Services.AI

  def chat(%{history: history}, _), do: AI.chat(history)

  def answer(%{prompt: prompt}, _), do: AI.answer(prompt)
end
