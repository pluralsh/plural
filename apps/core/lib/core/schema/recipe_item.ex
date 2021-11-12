defmodule Core.Schema.RecipeItem do
  use Piazza.Ecto.Schema
  alias Core.Schema.{RecipeSection, Chart, Terraform}

  defmodule Configuration do
    use Piazza.Ecto.Schema
    defenum Type, string: 0, int: 1, bool: 2, domain: 3, bucket: 4, file: 5

    defmodule Condition do
      use Piazza.Ecto.Schema

      defenum Operation, not: 0, gt: 1, lt: 2, eq: 3, gte: 4, lte: 5, prefix: 6, suffix: 7

      embedded_schema do
        field :field,     :string
        field :value,     :string
        field :operation, Operation
      end

      @valid ~w(field value operation)a

      def changeset(model, attrs \\ %{}) do
        model
        |> cast(attrs, @valid)
        |> validate_required([:field, :operation])
      end
    end

    embedded_schema do
      field :type,           Type
      field :name,           :string
      field :default,        :string
      field :documentation,  :string
      field :placeholder,    :string

      embeds_one :condition, Condition
    end

    @valid ~w(type name default documentation placeholder)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> cast_embed(:condition)
      |> validate_required([:type, :name])
    end
  end

  schema "recipe_items" do
    belongs_to :recipe_section, RecipeSection
    belongs_to :chart,          Chart
    belongs_to :terraform,      Terraform
    embeds_many :configuration, Configuration, on_replace: :delete

    timestamps()
  end

  @valid ~w(recipe_section_id chart_id terraform_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:configuration)
    |> foreign_key_constraint(:recipe_section_id)
    |> foreign_key_constraint(:chart_id)
    |> foreign_key_constraint(:terraform_id)
    |> unique_constraint(:chart_id, name: index_name(:recipe_items, [:recipe_section_id, :chart_id]))
    |> unique_constraint(:terraform_id, name: index_name(:recipe_items, [:recipe_section_id, :terraform_id]))
    |> validate_required([:recipe_section_id])
  end
end
