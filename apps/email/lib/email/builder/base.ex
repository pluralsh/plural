defmodule Email.Builder.Base do
  use Bamboo.Phoenix, view: EmailWeb.EmailView
  alias Core.Schema.User

  defmacro __using__(_) do
    quote do
      use Bamboo.Phoenix, view: EmailWeb.EmailView
      import Email.Builder.Base, only: [
        base_email: 0,
        expand_service_account: 1,
        active_cluster: 2
      ]
    end
  end

  def active_cluster(%User{} = user, fun) when is_function(fun) do
    case Core.Services.Clusters.has_cluster?(user) do
      true -> fun.()
      false -> :ok
    end
  end

  def base_email() do
    new_email()
    |> from("Plural.sh<notifications@plural.sh>")
    |> put_layout({EmailWeb.LayoutView, :email})
  end

  def expand_service_account(%User{service_account: true} = user),
    do: Core.Services.Accounts.accessible_users(user)
  def expand_service_account(user), do: user
end
