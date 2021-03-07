defmodule Core.Schema.ClusterInformation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Incident}

  schema "cluster_information" do
    field :git_commit, :string
    field :platform,   :string
    field :version,    :string

    belongs_to :incident, Incident

    timestamps()
  end

  @valid ~w(git_commit platform version incident_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:incident_id)
    |> unique_constraint(:incident_id)
  end
end
