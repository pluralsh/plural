defmodule Core.Schema.DomainMapping do
  use Piazza.Ecto.Schema
  alias Core.Schema.Account

  schema "domain_mappings" do
    field :domain,               :string
    field :enable_sso,           :boolean
    field :workos_connection_id, :string

    belongs_to :account, Account

    timestamps()
  end

  def for_account(query \\ __MODULE__, aid) do
    from(dm in query, where: dm.account_id == ^aid)
  end

  def for_domains(query \\ __MODULE__, domains) do
    from(dm in query, where: dm.domain in ^domains)
  end

  def for_connection(query \\ __MODULE__, conn_id) do
    from(dm in query, where: dm.workos_connection_id == ^conn_id)
  end

  @restricted Core.priv_file!("generic_emails.txt") |> String.split(~r/\s+/)

  def restricted(), do: @restricted

  @valid ~w(domain account_id enable_sso workos_connection_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> unique_constraint(:domain)
    |> validate_exclusion(:domain, @restricted, message: "cannot create domain mappings for consumer email domains")
    |> foreign_key_constraint(:account_id)
    |> validate_required([:domain])
  end
end
