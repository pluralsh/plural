defmodule Core.Schema.Database do
  use Piazza.Ecto.Schema
  alias Core.Schema.Repository

  defenum Engine, postgres: 0

  schema "databases" do
    field :engine, Engine
    field :target, :string
    field :port,   :integer
    field :name,   :string
    embeds_one :credentials, Credentials, on_replace: :update do
      field :user,   :string
      field :secret, :string
      field :key,    :string
    end

    belongs_to :repository, Repository

    timestamps()
  end

  @valid ~w(engine target port repository_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:credentials, with: &creds_changeset/2)
    |> foreign_key_constraint(:repository_id)
    |> validate_required([:engine, :port, :target, :name])
  end

  def creds_changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, [:secret, :key, :user])
    |> validate_required([:secret, :key, :user])
  end
end