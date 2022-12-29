defmodule Email.Builder.LockedInstallation do
  use Email.Builder.Base

  def email(inst) do
    %{installation: %{user: user}} = inst = Core.Repo.preload(inst, [:version, installation: [:user, :repository]])
    repo = inst.installation.repository
    base_email()
    |> to(expand_service_account(user))
    |> subject("Breaking Changes Need to be applied for #{repo.name}")
    |> assign(:type, inst_type(inst))
    |> assign(:user, user)
    |> assign(:installation, inst)
    |> assign(:deps, inst.version.dependencies)
    |> assign(:repo, repo)
    |> render(:locked_installation)
  end

  defp inst_type(%{chart: _}), do: :chart
  defp inst_type(%{terraform: _}), do: :terraform
end
