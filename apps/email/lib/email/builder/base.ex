defmodule Email.Builder.Base do
  use Bamboo.Phoenix, view: EmailWeb.EmailView

  defmacro __using__(_) do
    quote do
      use Bamboo.Phoenix, view: EmailWeb.EmailView
      import Email.Builder.Base, only: [base_email: 0]
    end
  end

  def base_email() do
    new_email()
    |> from("Plural.sh<notifications@plural.sh>")
    |> put_layout({EmailWeb.LayoutView, :email})
  end
end
