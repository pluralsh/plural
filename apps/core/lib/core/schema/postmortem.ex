defmodule Core.Schema.Postmortem do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Incident, User}

  defmodule ActionItem do
    use Piazza.Ecto.Schema

    defenum Type, pull: 0, issue: 1, blog: 2

    embedded_schema do
      field :type, Type
      field :link, :string
    end

    @valid ~w(type link)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:link])
    end
  end

  schema "postmortems" do
    field :content, :binary
    embeds_many :action_items, ActionItem

    belongs_to :incident, Incident
    belongs_to :creator,  User

    timestamps()
  end

  @valid ~w(content creator_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:content])
    |> foreign_key_constraint(:incident_id)
    |> foreign_key_constraint(:creator_id)
    |> unique_constraint(:incident_id)
  end
end
