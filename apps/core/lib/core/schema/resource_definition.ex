defmodule Core.Schema.ResourceDefinition do
  use Piazza.Ecto.Schema

  defmodule Specification do
    use Piazza.Ecto.Schema

    defenum Type, string: 0, int: 1, float: 2, bool: 3, object: 4, list: 5

    embedded_schema do
      field :type, Type
      field :name, :string
      field :required, :boolean, default: false

      embeds_many :spec, __MODULE__, on_replace: :delete
    end

    @valid ~w(type name)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> cast_embed(:spec)
      |> validate_required([:name, :type])
    end
  end

  schema "resource_definitions" do
    field :name, :string

    embeds_many :spec, Specification, on_replace: :delete

    timestamps()
  end

  @valid ~w(name)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> cast_embed(:spec)
    |> validate_required([:name, :spec])
  end

  def validate(%{spec: spec}, map) when is_map(map) do
    keys = Enum.map(spec, & &1.name)

    with {:subset, dropped} when map_size(dropped) == 0 <- {:subset, Map.drop(map, keys)},
         {:invalid, []} <- {:invalid, Enum.map(spec, &validate_spec(&1, map)) |> Enum.filter(& &1 != :ok)} do
      :ok
    else
      {:subset, dropped} -> {:error, ["Invalid keys #{Enum.join(Map.keys(dropped), ",")}"]}
      {:invalid, errors} -> {:error, errors}
    end
  end
  def validate(_, _)

  def validate_spec(%Specification{type: :int, name: name, required: required}, map),
    do: do_validate(map, name, required, &is_integer/1)
  def validate_spec(%Specification{type: :string, name: name, required: required}, map),
    do: do_validate(map, name, required, &is_binary/1)
  def validate_spec(%Specification{type: :float, name: name, required: required}, map),
    do: do_validate(map, name, required, &is_float/1)
  def validate_spec(%Specification{type: :bool, name: name, required: required}, map),
    do: do_validate(map, name, required, &is_boolean/1)
  def validate_spec(%Specification{type: :object, name: name, required: required} = spec, map),
    do: do_validate(map, name, required, &validate(spec, &1) == :ok)
  def validate_spec(%Specification{type: :list, name: name, required: required} = spec, map) do
    do_validate(map, name, required, fn
      list when is_list(list) -> Enum.all?(list, &validate(spec, &1) == :ok)
      _ -> false
    end)
  end

  defp do_validate(map, name, required, validator) do
    case {map, required} do
      {%{^name => val}, _} -> if validator.(val), do: :ok, else: "Invalid value for #{name}"
      {_, true} -> "#{name} is required"
      _ -> :ok
    end
  end
end