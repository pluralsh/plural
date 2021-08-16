defmodule Core.Services.Rbac do
  alias Core.Schema.{User, Role}

  def preload(user) do
    Core.Repo.preload(user, [:account, role_bindings: :role, group_role_bindings: :role])
  end

  def validate(user, action, opts \\ [])
  def validate(%User{id: id, account: %{id: aid, root_user_id: id}}, _, %{account: %{id: aid}}),
    do: true
  def validate(%User{id: id, account: %{root_user_id: id}}, _, %{account: %{}}), do: false
  def validate(%User{id: id, account: %{root_user_id: id}}, _, _), do: true
  def validate(%User{} = user, action, opts) do
    options = Map.new(opts)

    user
    |> preload()
    |> User.roles()
    |> maybe_filter(:repo, options)
    |> maybe_filter(:account, options)
    |> Enum.any?(&permits_action?(&1, action))
  end

  defp maybe_filter(roles, :repo, %{repository: repository}),
    do: Enum.filter(roles, &matches_repository?(&1, repository))
  defp maybe_filter(roles, :account, %{account: %{id: id}}),
    do: Enum.filter(roles, & &1.account_id == id)
  defp maybe_filter(roles, _, _), do: roles

  defp matches_repository?(%Role{repositories: repos}, repository) do
    repos
    |> Enum.map(& "^#{String.replace(&1, "*", ".*")}$" |> Regex.compile!())
    |> Enum.any?(&Regex.match?(&1, repository))
  end

  defp permits_action?(%Role{permissions: %Role.Permissions{} = perms}, action),
    do: Map.get(perms, action)
end
