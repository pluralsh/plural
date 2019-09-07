defmodule Api.Guardian do
  use Guardian, otp_app: :api
  alias Core.Schema.User
  alias Core.Services.Users

  def subject_for_token(%User{id: id}, _claims),
    do: {:ok, "user:#{id}"}
  def subject_for_token(_, _), do: {:error, :invalid_argument}

  def resource_from_claims(%{"sub" => "user:" <> id}) do
    case Users.get_user(id) do
      %User{} = user -> {:ok, user}
      _ -> {:error, :not_authorized}
    end
  end
  def resource_from_claims(_claims), do: {:error, :not_authorized}
end