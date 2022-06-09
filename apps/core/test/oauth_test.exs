defmodule Core.OAuthTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.OAuth.Github

  describe "#callback/3" do
    test "it will properly bootstrap a user" do
      expect(Github, :get_token!, fn "https://example.com", "code" -> "token" end)
      expect(Github, :get_user, fn "token" -> {:ok, %{name: "someone", email: "someone@gmail.com"}} end)

      {:ok, user} = Core.OAuth.callback(:github, "https://example.com", "code")

      assert user.name == "someone"
      assert user.email == "someone@gmail.com"
      assert user.trusted_icon
    end
  end
end
