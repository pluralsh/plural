defmodule Core.Services.Email do
  use Core.Services.Base
  alias Core.Schema.Email

  def mk(attrs) do
    %Email{}
    |> Email.changeset(attrs)
    |> Ecto.Changeset.apply_action(:update)
  end

  def send(%Email{} = email) do
    Email.bamboo(email)
    |> Core.Email.Mailer.deliver_now()
    |> IO.inspect()
  end
end