defmodule Core.Services.EncryptionTest do
  use Core.SchemaCase, async: true
  alias Core.Services.Encryption

  use Mimic

  describe "#create_backup/2" do
    test "it can create a new backup" do
      user = insert(:user)

      path = "/keybackups/#{user.id}/backup"
      vpath = "plural#{path}"
      expect(Vault, :auth, fn _, %{role: "plural", jwt: _} -> {:ok, :vault} end)
      expect(Vault, :write, fn :vault, ^vpath, %{secret: "key"} -> {:ok, %{}} end)

      {:ok, backup} = Encryption.create_backup(%{
        key: "key",
        name: "backup",
        repositories: ["git@github.com:some/repo.git"],
      }, user)

      assert backup.vault_path == path
      assert backup.user_id == user.id
      assert backup.name == "backup"
      assert backup.repositories == ["git@github.com:some/repo.git"]
    end

    test "if the backup already exists it will update" do
      user = insert(:user)
      backup = insert(:key_backup, user: user, name: "backup")

      path = backup.vault_path
      vpath = "plural#{path}"
      expect(Vault, :auth, fn _, %{role: "plural", jwt: _} -> {:ok, :vault} end)
      expect(Vault, :write, fn :vault, ^vpath, %{secret: "key"} -> {:ok, %{}} end)

      {:ok, update} = Encryption.create_backup(%{
        key: "key",
        name: "backup",
        repositories: ["git@github.com:some/repo.git"],
      }, user)

      assert update.id == backup.id
      assert update.vault_path == path
      assert update.user_id == user.id
      assert update.name == "backup"
      assert update.repositories == ["git@github.com:some/repo.git"]
    end
  end

  describe "#fetch/1" do
    test "it will get a backup value from vault" do
      backup = insert(:key_backup)

      p = "plural#{backup.vault_path}"
      expect(Vault, :auth, fn _, %{role: "plural", jwt: _} -> {:ok, :vault} end)
      expect(Vault, :read, fn :vault, ^p -> {:ok, %{"secret" => "value"}} end)

      {:ok, value} = Encryption.fetch(backup)

      assert value == "value"
    end
  end
end
