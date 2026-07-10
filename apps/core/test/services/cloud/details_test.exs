defmodule Core.Services.Cloud.DetailsTest do
  use Core.SchemaCase, async: false
  use Mimic

  alias Core.Clients.Console
  alias Core.Services.Cloud.Details

  describe "#details/1" do
    test "parses aws assume role from shared service cluster metadata" do
      external_id = Ecto.UUID.generate()
      client = :shared_console
      instance = build(:console_instance, type: :shared, external_id: external_id)

      expect(Console, :new, fn _, _ -> client end)
      expect(Console, :service, fn ^client, ^external_id ->
        {:ok, %{"cluster" => %{"metadata" => metadata("arn:aws:iam::123456789012:role/shared")}}}
      end)

      assert {:ok, %Details{aws_assume_role: "arn:aws:iam::123456789012:role/shared"}} =
               Details.details(instance)
    end

    test "parses aws assume role from dedicated stack metadata output" do
      external_id = Ecto.UUID.generate()
      client = :dedicated_console
      instance = build(:console_instance, type: :dedicated, external_id: external_id)

      expect(Console, :new, fn _, _ -> client end)
      expect(Console, :stack, fn ^client, ^external_id ->
        {:ok,
         %{
           "output" => [
             %{"name" => "metadata", "value" => Jason.encode!(metadata("arn:aws:iam::123456789012:role/dedicated"))},
             %{"name" => "console_url", "value" => "https://console.example.com"}
           ]
         }}
      end)

      assert {:ok, %Details{aws_assume_role: "arn:aws:iam::123456789012:role/dedicated"}} =
               Details.details(instance)
    end

    test "returns empty details when dedicated stack metadata output is invalid" do
      external_id = Ecto.UUID.generate()
      client = :dedicated_console
      instance = build(:console_instance, type: :dedicated, external_id: external_id)

      expect(Console, :new, fn _, _ -> client end)
      expect(Console, :stack, fn ^client, ^external_id ->
        {:ok, %{"output" => [%{"name" => "metadata", "value" => "not-json"}]}}
      end)

      assert {:ok, %Details{aws_assume_role: nil}} = Details.details(instance)
    end
  end

  defp metadata(role) do
    %{"iam" => %{"bedrock" => role}}
  end
end
