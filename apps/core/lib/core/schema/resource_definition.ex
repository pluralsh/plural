defmodule Core.Schema.ResourceDefinition do
  use Piazza.Ecto.Schema

  defmodule Specification do
    use Piazza.Ecto.Schema

    defenum Type, string: 0, int: 1, float: 2, bool: 3, object: 4, list: 5

    embedded_schema do
      field :type, Type
      field :inner, Type
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
    IO.inspect(map)
    keys = Enum.map(spec, & &1.name)

    with {:subset, dropped} when map_size(dropped) == 0 <- {:subset, Map.drop(map, keys)},
         {:invalid, []} <- {:invalid, Enum.map(spec, &validate_spec(&1, map)) |> Enum.filter(& &1 != :ok)} do
      :ok
    else
      {:subset, dropped} -> {:error, ["Invalid keys #{Enum.join(Map.keys(dropped), ",")}"]}
      {:invalid, errors} -> {:error, errors}
    end
  end
  def validate(_, val), do: {:error, ["invalid type for #{inspect(val)}"]}

  @primitive_types ~w(int string float bool)a

  def validate_spec(%Specification{type: type, name: name, required: required}, map) when type in @primitive_types,
    do: do_validate(map, name, required, &primitive_type(type, &1))
  def validate_spec(%Specification{type: :object, name: name, required: required} = spec, map),
    do: do_validate(map, name, required, &validate(spec, &1) == :ok)
  def validate_spec(%Specification{type: :list, name: name, required: required} = spec, map) do
    do_validate(map, name, required, fn
      list when is_list(list) -> Enum.all?(list, &validate_inner(spec, &1))
      _ -> false
    end)
  end

  defp primitive_type(:int, val) when is_integer(val), do: true
  defp primitive_type(:string, val) when is_binary(val), do: true
  defp primitive_type(:bool, val) when is_boolean(val), do: true
  defp primitive_type(:float, val) when is_float(val), do: true
  defp primitive_type(_, _), do: false

  defp validate_inner(%Specification{inner: type}, value) when type in @primitive_types,
    do: primitive_type(type, value)
  defp validate_inner(%Specification{} = spec, value), do: validate(spec, value) == :ok

  defp do_validate(map, name, required, validator) do
    case {map, required} do
      {%{^name => val}, _} -> if validator.(val), do: :ok, else: "Invalid value for #{name}"
      {_, true} -> "#{name} is required"
      _ -> :ok
    end
  end
end