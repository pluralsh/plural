defmodule Email.Builder.ConsoleReaped do
  use Email.Builder.Base
  alias Core.Schema.ConsoleInstance

  def email(inst) do
    %{owner: user} = inst = Core.Repo.preload(inst, [:owner])

    base_email()
    |> to(expand_service_account(user))
    |> subject("Your Plural Cloud Instance #{inst.name} is eligible to be decommissioned")
    |> assign(:inst, inst)
    |> assign(:warning, warning(inst))
    |> render(:console_reaped)
  end

  defp warning(%ConsoleInstance{second_notif_at: nil}), do: 1
  defp warning(_), do: 2
end
