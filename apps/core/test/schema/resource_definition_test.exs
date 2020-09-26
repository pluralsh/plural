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

    test "it can validate silo workflow specs" do
      definition = silo_definition()
      path = Path.join(:code.priv_dir(:core), "dicom.yml")
      {:ok, %{"spec" => spec}} = YamlElixir.read_from_file(path)
      :ok = ResourceDefinition.validate(definition, spec)
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

  defp silo_definition() do
    build(:resource_definition, spec: [
      build(:specification, name: "workflow", type: :object, spec: [
        build(:specification, name: "name", type: :string, required: true),
        build(:specification, name: "mappings", type: :list, spec: [
          build(:specification, name: "extension", type: :string, required: true)
        ]),
        build(:specification, name: "sections", required: true, type: :list, spec: [
          build(:specification, name: "index", type: :int, required: true),
          build(:specification, name: "source", type: :string, required: true),
          build(:specification, name: "source_name", type: :string),
          build(:specification, name: "operations", type: :list, spec: [
            build(:specification, name: "image", type: :string, required: true),
            build(:specification, name: "command", type: :string),
            build(:specification, name: "entrypoint", type: :string),
            build(:specification, name: "output", type: :string, required: true),
            build(:specification, name: "args", type: :list, inner: :string),
            build(:specification, name: "destination", type: :string),
            build(:specification, name: "destination_type", type: :string, required: true),
          ]),
        ])
      ])
    ])
  end
end