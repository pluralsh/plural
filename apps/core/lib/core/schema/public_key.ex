defmodule Core.Schema.PublicKey do
  use Piazza.Ecto.Schema
  alias Core.Schema.User

  schema "public_keys" do
    field :name,    :string
    field :content, :binary
    field :digest,  :string
    belongs_to :user, User

    timestamps()
  end

  def for_emails(query \\ __MODULE__, emails, account) do
    from(pk in query,
      join: u in assoc(pk, :user), as: :user,
      where: u.email in ^emails and u.account_id == ^account
    )
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :id]) do
    from(pk in query, order_by: ^order)
  end

  def for_user(query \\ __MODULE__, user_id) do
    from(pk in query, where: pk.user_id == ^user_id)
  end

  @valid ~w(content user_id name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> add_digest()
    |> unique_constraint(:digest)
    |> unique_constraint(:name, name: index_name(:public_keys, [:user_id, :name]))
    |> foreign_key_constraint(:user_id)
    |> validate_required([:content, :name])
  end

  defp add_digest(cs) do
    case get_field(cs, :content) do
      content when is_binary(content) ->
        put_change(cs, :digest, "SHA256:#{Core.sha(content)}")
      _ ->
        cs
    end
  end
end
