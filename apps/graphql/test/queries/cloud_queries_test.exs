defmodule GraphQl.CloudQueriesTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers
  alias Core.Clients.Console

  describe "cloudSettings" do
    test "it can list supported regions" do
      {:ok, %{data: %{"cloudSettings" => settings}}} = run_query("""
        query {
          cloudSettings {
            regions {
              shared { aws }
              dedicated { aws }
            }
          }
        }
      """, %{}, %{current_user: insert(:user)})

      refute Enum.empty?(settings["regions"]["shared"]["aws"])
      refute Enum.empty?(settings["regions"]["dedicated"]["aws"])
    end
  end

  describe "consoleInstances" do
    test "it can fetch the cloud instances in your account" do
      user = insert(:user)
      instances = insert_list(3, :console_instance, owner: insert(:user, account: user.account))
      insert_list(2, :console_instance)

      {:ok, %{data: %{"consoleInstances" => found}}} = run_query("""
        query {
          consoleInstances(first: 5) {
            edges { node { id } }
          }
        }
      """, %{}, %{current_user: user})

      assert from_connection(found)
             |> ids_equal(instances)
    end
  end

  describe "consoleInstance" do
    test "you can describe console instances you can see" do
      user = insert(:user)
      instance = insert(:console_instance, owner: insert(:user, account: user.account))

      {:ok, %{data: %{"consoleInstance" => found}}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) { id }
        }
      """, %{"id" => instance.id}, %{current_user: user})

      assert found["id"] == instance.id
    end

    test "it can sideload a console cluster" do
      user = insert(:user)
      instance = insert(:console_instance, owner: insert(:user, account: user.account))
      cluster = insert(:cluster, console_url: "https://#{instance.url}", owner: user)

      {:ok, %{data: %{"consoleInstance" => found}}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) {
            id
            console { id }
          }
        }
      """, %{"id" => instance.id}, %{current_user: user})

      assert found["id"] == instance.id
      assert found["console"]["id"] == cluster.id
    end

    test "it can resolve console instance details" do
      user = insert(:user)
      instance = insert(:console_instance, owner: insert(:user, account: user.account), type: :shared)
      client = :console

      expect(Console, :new, fn _, _ -> client end)
      expect(Console, :service, fn ^client, id ->
        assert id == instance.external_id

        {:ok,
         %{
           "cluster" => %{
             "metadata" => %{
               "iam" => %{"bedrock" => "arn:aws:iam::123456789012:role/shared"}
             }
           }
         }}
      end)

      {:ok, %{data: %{"consoleInstance" => found}}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) {
            id
            details { awsAssumeRole }
          }
        }
      """, %{"id" => instance.id}, %{current_user: user})

      assert found["id"] == instance.id
      assert found["details"]["awsAssumeRole"] == "arn:aws:iam::123456789012:role/shared"
    end

    test "you cannot describe console instances you cannot see" do
      user = insert(:user)
      instance = insert(:console_instance)

      {:ok, %{errors: [_ | _]}} = run_query("""
        query Get($id: ID!) {
          consoleInstance(id: $id) { id }
        }
      """, %{"id" => instance.id}, %{current_user: user})
    end
  end
end
