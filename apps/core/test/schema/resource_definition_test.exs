defmodule Core.Schema.ResourceDefinitionTest do
  use Core.SchemaCase, async: true

  alias Core.Schema.{ResourceDefinition}

  describe "#validate/2" do
    test "If it includes an unsupported key, it will error" do
      {:error, _} = ResourceDefinition.validate(definition(), %{"invalid" => "key"})
    end

    test "If a key contains the wrong type, it will error" do
      {:error, _} = ResourceDefinition.validate(definition(), %{"str" => 1})
    end

    test "It will validate nested keys" do
      {:error, _} = ResourceDefinition.validate(definition(), %{"str" => "val", "nest" => %{"nested" => 1}})
    end

    test "it will validate lists" do
      {:error, _} = ResourceDefinition.validate(definition(), %{"str" => "val", "list" => [%{"bogus" => "value"}]})
      {:error, _} = ResourceDefinition.validate(definition(), %{"str" => "val", "list" => %{"bogus" => "value"}})
      {:error, _} = ResourceDefinition.validate(definition(), %{"str" => "val", "list-int" => ["a", "b"]})
    end

    test "It will pass on valid input" do
      :ok = ResourceDefinition.validate(definition(), %{
        "str" => "val",
        "nest" => %{"nested" => "val"}
      })

      :ok = ResourceDefinition.validate(definition(), %{
        "str" => "val",
      })

      :ok = ResourceDefinition.validate(definition(), %{
        "str" => "val",
        "nest" => %{"nested" => "val"},
        "int" => 1
      })

      :ok = ResourceDefinition.validate(definition(), %{
        "str" => "val",
        "list" => [%{"list-ind" => "a"}]
      })

      :ok = ResourceDefinition.validate(definition(), %{
        "str" => "val",
        "list-int" => [1, 2]
      })
    end
  end

  defp definition() do
    build(:resource_definition, spec: [
      build(:specification, name: "str", type: :string, required: true),
      build(:specification, name: "int", type: :int),
      build(:specification, name: "nest", type: :object, spec: [
        build(:specification, name: "nested", type: :string, required: true)
      ]),
      build(:specification, name: "list", type: :list, spec: [
        build(:specification, name: "list-ind", type: :string)
      ]),
      build(:specification, name: "list-int", type: :list, inner: :int)
    ])
  end
end