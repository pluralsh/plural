defmodule Core.Schema.Invite do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Account, User, InviteGroup, OIDCProvider}

  @email_re ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}$/

  schema "invites" do
    field :email,     :string
    field :secure_id, :string
    field :admin,     :boolean

    belongs_to :user,    User
    belongs_to :account, Account
    belongs_to :service_account, User
    belongs_to :oidc_provider, OIDCProvider

    has_many :invite_groups, InviteGroup, on_replace: :delete
    has_many :groups, through: [:invite_groups, :group]

    timestamps()
  end

  def expired(query \\ __MODULE__) do
    expiry = Timex.now() |> Timex.shift(days: -2)
    from(i in query, where: i.inserted_at < ^expiry)
  end

  def for_account(query \\ __MODULE__, aid) do
    from(i in query, where: i.account_id == ^aid)
  end

  @valid ~w(email account_id user_id admin service_account_id oidc_provider_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_assoc(:invite_groups)
    |> put_new_change(:secure_id, &gen_external_id/0)
    |> foreign_key_constraint(:account_id)
    |> foreign_key_constraint(:oidc_provider_id)
    |> foreign_key_constraint(:service_account_id)
    |> unique_constraint(:secure_id)
    |> unique_constraint(:email)
    |> validate_format(:email, @email_re)
    |> validate_required([:email, :account_id,  :secure_id])
  end

  defp gen_external_id() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end
end
