defmodule Core.SchemaCase do
  @moduledoc """
  This module defines the setup for tests requiring
  access to the application's data layer.

  You may define functions here to be used as helpers in
  your tests.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """
  use ExUnit.CaseTemplate
  import Core.Factory

  using do
    quote do
      alias Core.Repo

      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Core.SchemaCase
      import Core.Factory
      import Core.TestHelpers
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Core.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Core.Repo, {:shared, self()})
    end

    :ok
  end

  def errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {message, opts} ->
      Regex.replace(~r"%{(\w+)}", message, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end

  def setup_root_user(_) do
    user = insert(:user, email_confirmed: true)
    {:ok, %{user: user, account: account}} = Core.Services.Accounts.create_account(user)
    [user: %{user | account: account}, account: account]
  end

  def setup_trial(_) do
    [plan: trial_plan()]
  end

  def dns_resp(external_id) do
    {:ok, %Tesla.Env{body: %{"result" => %{"id" => external_id}}}}
  end
end
