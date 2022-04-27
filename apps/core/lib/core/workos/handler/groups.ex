defimpl Core.WorkOS.Handler, for: [Core.WorkOS.Events.GroupCreated, Core.WorkOS.Events.GroupUpdated] do
  alias Core.WorkOS.Resources
  alias Core.Schema.Group

  def handle(%@for{group: %{external_id: eid} = attrs, directory_id: id}) do
    %{account_id: aid} = Resources.get_directory(id)

    case Resources.get_group(eid) do
      %Group{} = group -> group
      _ -> %Group{account_id: aid}
    end
    |> Group.changeset(attrs)
    |> Ecto.Changeset.change(%{external_id: eid})
    |> Core.Repo.insert_or_update()
  end
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.GroupDeleted do
  alias Core.WorkOS.Resources
  alias Core.Schema.Group

  def handle(%@for{group: %{external_id: eid}}) do
    case Resources.get_group(eid) do
      nil -> :ok
      g -> Core.Repo.delete(g)
    end
  end
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.GroupUserCreated do
  alias Core.Services.Accounts
  alias Core.WorkOS.Resources
  alias Core.Schema.{Group, User}

  def handle(%@for{group: %{external_id: gid}, user: %{external_id: uid}, directory_id: dir_id}) do
    with %{account_id: aid} <- Resources.get_directory(dir_id),
         {_, user} <- Resources.account(aid),
         %Group{id: group_id} <- Resources.get_group(gid),
         %User{id: user_id} <- Resources.get_user(uid),
      do: Accounts.create_group_member(%{user_id: user_id}, group_id, user)
  end
end

defimpl Core.WorkOS.Handler, for: Core.WorkOS.Events.GroupUserDeleted do
  alias Core.Services.Accounts
  alias Core.WorkOS.Resources
  alias Core.Schema.{Group, User}

  def handle(%@for{group: %{external_id: gid}, user: %{external_id: uid}, directory_id: dir_id}) do
    with %{account_id: aid} <- Resources.get_directory(dir_id),
         {_, user} <- Resources.account(aid),
         %Group{id: group_id} <- Resources.get_group(gid),
         %User{id: user_id} <- Resources.get_user(uid),
      do: Accounts.delete_group_member(group_id, user_id, user)
  end
end
