defmodule GraphQl.Schema.AI do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.AI

  input_object :chat_message_attributes do
    field :role,    non_null(:string)
    field :content, non_null(:string)
    field :name,    :string
  end

  object :chat_message do
    field :role,    non_null(:string)
    field :content, non_null(:string)
    field :name,    :string
  end

  object :ai_queries do
    field :chat, :chat_message do
      middleware Authenticated, :external
      arg :history, list_of(:chat_message_attributes)

      safe_resolve &AI.chat/2
    end

    field :help_question, :string do
      middleware Authenticated
      arg :prompt, non_null(:string)

      safe_resolve &AI.answer/2
    end
  end
end
