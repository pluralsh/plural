defimpl Core.WorkOS.Handler, for: [Core.WorkOS.Events.UserCreated, Core.WorkOS.Events.UserUpdated] do
  alias Core.WorkOS.Resources
  alias Core.Schema.User

  def handle(%@for{user: %{external_id: eid} = attrs, directory_id: id}) do
    %{account_id: aid} = Resources.get_directory(id)

    case Core.Repo.get_by(User, external_id: eid) do
      %User{} = user -> user
      _ -> %User{account_id: aid, external_id: eid}
    end
    |> User.changeset(attrs)
    |> Core.Repo.insert_or_update()
  end
end
