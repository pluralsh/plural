defmodule Core.Schema.ScanViolation do
  use Piazza.Ecto.Schema
  alias Core.Schema.PackageScan

  schema "scan_violations" do
    field :rule_name,     :string
    field :description,   :binary
    field :rule_id,       :string
    field :severity,      Core.Schema.Vulnerability.Grade
    field :category,      :string
    field :resource_name, :string
    field :resource_type, :string
    field :line,          :integer
    field :file,          :string

    belongs_to :scan, PackageScan

    timestamps()
  end

  @valid ~w(rule_name description rule_id file severity category resource_name resource_type line scan_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> foreign_key_constraint(:scan_id)
  end
end
