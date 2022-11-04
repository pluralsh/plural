defmodule GraphQl.Schema.AI do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.AI

  object :ai_queries do
    field :help_question, :string do
      middleware Authenticated
      arg :prompt, non_null(:string)

      safe_resolve &AI.answer/2
    end
  end
end
