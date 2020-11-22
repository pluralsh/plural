defmodule Core.Schema.TerraformInstallation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Terraform, Installation, Version}

  schema "terraform_installations" do
    belongs_to :installation, Installation
    belongs_to :terraform, Terraform
    belongs_to :version, Version

    timestamps()
  end

  def for_repo(query \\ __MODULE__, repo_id) do
    from(ti in query,
      join: c in assoc(ti, :terraform), as: :terraform,
      where: c.repository_id == ^repo_id)
  end

  def for_repo_name(query \\ __MODULE__, repo_name) do
    from(ti in query,
      join: t in assoc(ti, :terraform), as: :terraform,
      join: r in assoc(t, :repository), as: :repo,
      where: r.name == ^repo_name)
  end

  def for_terraform_name(query \\ __MODULE__, terraform_name)
  def for_terraform_name(query, names) when is_list(names) do
    from([ti, terraform: t] in query,
      where: t.name in ^names)
  end
  def for_terraform_name(query, terraform_name) do
    from([ti, terraform: t] in query,
      where: t.name == ^terraform_name)
  end

  def for_terraform(query \\ __MODULE__, terraform_id) do
    from(ti in query,
      join: t in assoc(ti, :terraform), as: :terraform,
      where: t.id == ^terraform_id)
  end

  def for_user(query, user_id) do
    from([ti, terraform: c] in query,
      join: inst in Installation,
        on: inst.id == ti.installation_id and c.repository_id == inst.repository_id,
      where: inst.user_id == ^user_id
    )
  end

  @valid ~w(installation_id terraform_id version_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:installation_id, :terraform_id])
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:terraform_id)
    |> unique_constraint(:terraform, name: index_name(:terraform_installations, [:terraform_id, :installation_id]))
  end
end