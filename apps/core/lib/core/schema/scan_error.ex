defmodule Core.Schema.ScanError do
  use Piazza.Ecto.Schema
  alias Core.Schema.PackageScan

  schema "scan_errors" do
    field :message, :string

    belongs_to :scan, PackageScan

    timestamps()
  end

  @valid ~w(message scan_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:scan_id)
  end
end
