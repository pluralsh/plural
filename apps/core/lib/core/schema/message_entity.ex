defmodule Core.Schema.MessageEntity do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, IncidentMessage}

  defenum Type, mention: 0, emoji: 1

  schema "message_entities" do
    field :type,        Type
    field :text,        :string
    field :start_index, :integer
    field :end_index,   :integer

    belongs_to :message, IncidentMessage
    belongs_to :user,    User

    timestamps()
  end

  @valid ~w(type text user_id message_id start_index end_index)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:message_id)
    |> validate_required([:type, :start_index, :end_index])
  end
end
