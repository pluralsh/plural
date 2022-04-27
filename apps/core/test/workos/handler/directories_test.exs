defmodule Core.WorkOS.Handler.DirectoriesTest do
  use Core.SchemaCase, async: true
  alias Core.WorkOS.{Event, Resources, Handler}

  describe "DsyncActivated" do
    test "it will create a directory record" do
      %{account: acc} = mapping = insert(:domain_mapping)
      payload = Jason.encode!(%{
        event: "dsync.activated",
        data: %{id: "dir_id", domains: [%{domain: mapping.domain}]}
      })

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      directory = Resources.get_directory("dir_id")
      assert directory.account_id == acc.id
    end
  end

  describe "DsyncDeleted" do
    test "it will delete a directory record" do
      %{account: acc} = mapping = insert(:domain_mapping)
      payload = Jason.encode!(%{
        event: "dsync.deleted",
        data: %{id: "dir_id", domains: [%{domain: mapping.domain}]}
      })
      dir = insert(:account_directory, account: acc, directory_id: "dir_id")

      event = Jason.decode!(payload) |> Event.parse()
      Handler.handle(event)

      refute refetch(dir)
    end
  end
end
