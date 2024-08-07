defmodule GraphQl.CloudMutationsTest do
  use Core.SchemaCase, async: true
  use Mimic
  import GraphQl.TestHelpers

  describe "createConsoleInstance" do
    test "it can create an instance" do
      account = insert(:account)
      enable_features(account, [:cd])
      user = admin_user(account)
      insert(:cloud_cluster)
      insert(:cockroach_cluster)
      insert(:repository, name: "console")

      expect(HTTPoison, :post, fn _, _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{client_id: "123", client_secret: "secret"})}}
      end)

      {:ok, %{data: %{"createConsoleInstance" => created}}} = run_query("""
        mutation Create($attrs: ConsoleInstanceAttributes!) {
          createConsoleInstance(attributes: $attrs) {
            id
            name
            region
            size
            cloud
          }
        }
      """, %{"attrs" => %{
        "name" => "plrltest",
        "cloud" => "AWS",
        "size" => "SMALL",
        "region" => "us-east-1"
      }}, %{current_user: user})

      assert created["name"] == "plrltest"
      assert created["cloud"] == "AWS"
      assert created["size"] == "SMALL"
      assert created["region"] == "us-east-1"
    end
  end

  describe "updateConsoleInstance" do
    test "you can update an instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      instance = insert(:console_instance, owner: sa)

      {:ok, %{data: %{"updateConsoleInstance" => updated}}} = run_query("""
        mutation Update($id: ID!, $attrs: ConsoleInstanceUpdateAttributes!) {
          updateConsoleInstance(id: $id, attributes: $attrs) {
            id
            size
          }
        }
      """, %{"id" => instance.id, "attrs" => %{"size" => "MEDIUM"}}, %{current_user: user})

      assert updated["id"] == instance.id
      assert updated["size"] == "MEDIUM"
    end
  end

  describe "deleteConsoleInstance" do
    test "you can delete your instance" do
      user = insert(:user)
      sa  = insert(:user, service_account: true)
      insert(:impersonation_policy_binding,
        policy: build(:impersonation_policy, user: sa),
        user: user
      )
      instance = insert(:console_instance, owner: sa)

      {:ok, %{data: %{"deleteConsoleInstance" => deleted}}} = run_query("""
        mutation Deleted($id: ID!) {
          deleteConsoleInstance(id: $id) {
            id
            deletedAt
          }
        }
      """, %{"id" => instance.id}, %{current_user: user})

      assert deleted["id"] == instance.id
    end
  end
end
