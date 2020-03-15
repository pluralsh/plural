defmodule Watchman.Guardian do
  use Guardian, otp_app: :watchman
  alias Watchman.Schema.User

  def subject_for_token(%User{id: id}, _claims),
    do: {:ok, "user:#{id}"}
  def subject_for_token(_, _), do: {:error, :invalid_argument}

  def resource_from_claims(%{"user" => user}), do: {:ok, user}
  def resource_from_claims(%{"sub" => "user:" <> id}) do
    case Watchman.Repo.get(User, id) do
      %User{} = user -> {:ok, user}
      _ -> {:error, :not_authorized}
    end
  end
  def resource_from_claims(_claims), do: {:error, :not_authorized}
end