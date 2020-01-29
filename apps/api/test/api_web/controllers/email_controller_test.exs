defmodule ApiWeb.EmailControllerTest do
  use ApiWeb.ConnCase, async: true
  alias Core.Schema.Email
  use Bamboo.Test

  describe "#email" do
    test "Valid license tokens can send emails", %{conn: conn} do
      license_token = insert(:license_token)
      email_path = Routes.email_path(conn, :email)

      conn
      |> authorized(license_token)
      |> post(email_path, %{
        to: "someone@example.com",
        from: "else@example.com",
        subject: "Hey",
        html_body: "You"
      })
      |> json_response(200)

      assert_delivered_email Email.bamboo(%Email{
        to: "someone@example.com",
        from: "else@example.com",
        subject: "Hey",
        html_body: "You"
      })
    end
  end
end