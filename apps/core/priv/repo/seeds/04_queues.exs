import Botanist
alias Core.Repo
alias Core.Schema.{User, UpgradeQueue}

seed do
  Core.Repo.all(User)
  |> Enum.map(fn user ->
    {:ok, _} =
      %UpgradeQueue{user_id: user.id}
      |> UpgradeQueue.changeset()
      |> Core.Repo.insert()
  end)
end
