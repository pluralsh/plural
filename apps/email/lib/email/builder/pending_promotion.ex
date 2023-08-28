defmodule Email.Builder.PendingPromotion do
  use Email.Builder.Base

  def email(update) do
    %{user: user} = update = Core.Repo.preload(update, [
      :user,
      terraform_installation: [installation: :repository],
      chart_installation: [installation: :repository]
    ])
    repo = find_repo(update)

    base_email()
    |> to(expand_service_account(user))
    |> subject("You have an upgrade pending promotion for #{repo.name}")
    |> assign(:user, user)
    |> assign(:repo, repo)
    |> render(:pending_promotion)
  end

  defp find_repo(%{terraform_installation: %{installation: %{repository: repo}}}), do: repo
  defp find_repo(%{chart_installation: %{installation: %{repository: repo}}}), do: repo
end
