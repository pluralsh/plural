defmodule Core.OAuth.SSO do
  def redirect_url(h \\ nil), do: "https://#{h || host()}/sso/callback"

  def host(), do: Application.get_env(:core, :host)

  def normalize(profile) do
    %{
      email: profile["email"],
      name: "#{profile["first_name"]} #{profile["last_name"]}",
      avatar: avatar(profile)
    }
  end

  defp avatar(%{"raw_attributes" => %{"avatar" => a}}), do: a
  defp avatar(%{"raw_attributes" => %{"profile" => a}}), do: a
  defp avatar(_), do: nil
end
