defmodule Core.Schema.Installation do
  use Core.DB.Schema
  alias Core.Schema.{Chart, User}

  schema "installations" do
    field :version, :string

    belongs_to :user, User
    belongs_to :chart, Chart

    timestamps()
  end

  @valid ~w(version user_id chart_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:version, :user_id, :chart_id])
    |> unique_constraint(:chart_id, name: index_name(:installations, [:user_id, :chart_id]))
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:chart_id)
  end
end