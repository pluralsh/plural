defimpl Core.WorkOS.Handler, for: [Core.WorkOS.Events.UserCreated, Core.WorkOS.Events.UserUpdated] do
  alias Core.WorkOS.Resources
  alias Core.Schema.User

  def handle(%@for{user: %{external_id: eid} = attrs, directory_id: id}) do
    %{account_id: aid} = Resources.get_directory(id)

    case fetch_user(attrs) do
      %User{} = user -> user
      _ -> %User{account_id: aid}
    end
    |> User.changeset(attrs)
    |> Ecto.Changeset.change(%{external_id: eid})
    |> Core.Repo.insert_or_update()
  end

  defp fetch_user(%{external_id: eid, email: email}) do
    with nil <- Core.Repo.get_by(User, external_id: eid),
      do: Core.Repo.get_by(User, email: email)
  end
end
