defmodule GraphQl.Resolvers.AI do
  alias Core.Services.AI

  def answer(%{prompt: prompt}, _), do: AI.answer(prompt)
end
