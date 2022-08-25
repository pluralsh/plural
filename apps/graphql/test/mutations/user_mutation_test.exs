defmodule GraphQl.UserMutationTest do
  use Core.SchemaCase, async: true
  import GraphQl.TestHelpers
  alias Core.Services.Users
  use Mimic

  describe "login" do
    test "A user can log in with a password" do
      {:ok, user} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{data: %{"login" => found}}} = run_query("""
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
            jwt
          }
        }
      """, %{"email" => "mguarino46@gmail.com", "password" => "super strong password"})

      assert found["id"] == user.id
      assert found["jwt"]
    end

    test "Incorrect passwords fail" do
      {:ok, _} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{errors: [_ | _]}} = run_query("""
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            id
          }
        }
      """, %{"email" => "mguarino46@gmail.com", "password" => "incorrect password"})
    end

    test "it can activate login tokens" do
      {:ok, user} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })
      token = insert(:login_token)

      {:ok, %{data: %{"login" => found}}} = run_query("""
        mutation Login($email: String!, $password: String!, $deviceToken: String) {
          login(email: $email, password: $password, deviceToken: $deviceToken) {
            id
            jwt
          }
        }
      """, %{
        "email" => "mguarino46@gmail.com",
        "password" => "super strong password",
        "deviceToken" => token.token
      })

      assert found["id"] == user.id
      assert refetch(token).active
    end
  end

  describe "passwordlessLogin" do
    test "it will login based on a pwdless login token" do
      token = insert(:login_token)
      login = insert(:passwordless_login, login_token: token, user: token.user)

      {:ok, %{data: %{"passwordlessLogin" => user}}} = run_query("""
        mutation Login($token: String!) {
          passwordlessLogin(token: $token) { id jwt }
        }
      """, %{"token" => login.token})

      assert user["id"] == login.user_id
      assert user["jwt"]
    end
  end

  describe "loginToken" do
    test "it can poll a user's login token" do
      token = insert(:login_token, active: true)

      {:ok, %{data: %{"loginToken" => user}}} = run_query("""
        mutation Poll($token: String!) {
          loginToken(token: $token) { id jwt }
        }
      """, %{"token" => token.token})

      assert user["id"] == token.user.id
      assert user["jwt"]
    end

    test "it can activate ancillary login tokens" do
      token = insert(:login_token, active: true)
      device = insert(:login_token)

      {:ok, %{data: %{"loginToken" => user}}} = run_query("""
        mutation Poll($token: String!, $deviceToken: String) {
          loginToken(token: $token, deviceToken: $deviceToken) { id jwt }
        }
      """, %{"token" => token.token, "deviceToken" => device.token})

      assert user["id"] == token.user.id
      assert user["jwt"]

      assert refetch(device).active
    end
  end

  describe "signup" do
    test "it can create a new user" do
      token = insert(:login_token)
      {:ok, %{data: %{"signup" => signup}}} = run_query("""
        mutation Signup($attributes: UserAttributes!, $deviceToken: String) {
          signup(attributes: $attributes, deviceToken: $deviceToken) {
            id name email jwt
          }
        }
      """, %{
        "attributes" => %{
          "email" => "mguarino46@gmail.com",
          "password" => "super strong password",
          "name" => "Michael Guarino"
        },
        "deviceToken" => token.token
      })

      assert signup["id"]
      assert signup["name"] == "Michael Guarino"
      assert signup["email"] == "mguarino46@gmail.com"
      assert signup["jwt"]

      assert refetch(token).active
    end

    test "it can set account name" do
      {:ok, %{data: %{"signup" => signup}}} = run_query("""
        mutation Signup($attributes: UserAttributes!, $account: AccountAttributes!) {
          signup(attributes: $attributes, account: $account) {
            id
            name
            email
            jwt
            account { name }
          }
        }
      """, %{"attributes" => %{
        "email" => "mguarino46@gmail.com",
        "password" => "super strong password",
        "name" => "Michael Guarino"
      }, "account" => %{"name" => "account"}})

      assert signup["id"]
      assert signup["name"] == "Michael Guarino"
      assert signup["email"] == "mguarino46@gmail.com"
      assert signup["jwt"]
      assert signup["account"]["name"] == "account"
    end

    test "it can create a user by invite" do
      invite = insert(:invite)
      {:ok, %{data: %{"signup" => signup}}} = run_query("""
        mutation Signup($attributes: UserAttributes!, $id: String) {
          signup(attributes: $attributes, inviteId: $id) {
            id name email jwt
          }
        }
      """, %{"attributes" => %{
        "email" => "mguarino46@gmail.com",
        "password" => "super strong password",
        "name" => "Michael Guarino"
      }, "id" => invite.secure_id})

      assert signup["id"]
      assert signup["name"] == "Michael Guarino"
      assert signup["email"] == "mguarino46@gmail.com"
      assert signup["jwt"]
    end
  end

  describe "updateUser" do
    test "Users can update themselves" do
      {:ok, user} = Users.create_user(%{
        name: "Michael Guarino",
        email: "mguarino46@gmail.com",
        password: "super strong password"
      })

      {:ok, %{data: %{"updateUser" => updated}}} = run_query("""
        mutation UpdateUser($name: String, $loginMethod: LoginMethod) {
          updateUser(attributes: {name: $name, loginMethod: $loginMethod}) {
            id
            name
            loginMethod
          }
        }
      """, %{"name" => "Updated User", "loginMethod" => "PASSWORDLESS"}, %{current_user: user})

      assert updated["id"] == user.id
      assert updated["name"] == "Updated User"
      assert updated["loginMethod"] == "PASSWORDLESS"
    end
  end

  describe "createPublisher" do
    test "A user can create a publisher" do
      user = insert(:user)

      {:ok, %{data: %{"createPublisher" => publisher}}} = run_query("""
        mutation CreatePublisher($attrs: PublisherAttributes!) {
          createPublisher(attributes: $attrs) {
            id
            name
            owner {
              id
            }
          }
        }
      """, %{"attrs" => %{"name" => "my publisher"}}, %{current_user: user})

      assert publisher["id"]
      assert publisher["name"] == "my publisher"
      assert publisher["owner"]["id"] == user.id
    end
  end

  describe "updatePublisher" do
    test "A user can update their publisher" do
      %{owner: user} = pub = insert(:publisher)

      {:ok, %{data: %{"updatePublisher" => update}}} = run_query("""
        mutation UpdatePublisher($name: String) {
          updatePublisher(attributes: {name: $name}) {
            id
            name
          }
        }
      """, %{"name" => "updated publisher"}, %{current_user: user})

      assert update["id"] == pub.id
      assert update["name"] == "updated publisher"
    end
  end

  describe "createToken" do
    test "A user can create a token for themself" do
      user = insert(:user)

      {:ok, %{data: %{"createToken" => token}}} = run_query("""
        mutation {
          createToken {
            id
            token
          }
        }
      """, %{}, %{current_user: user})

      assert token["id"]
      assert token["token"]
    end
  end

  describe "deleteToken" do
    test "A user can delete a persisted token" do
      user = insert(:user)
      token = insert(:persisted_token, user: user)

      {:ok, %{data: %{"deleteToken" => deleted}}} = run_query("""
        mutation DeleteToken($id: ID!) {
          deleteToken(id: $id) {
            id
          }
        }
      """, %{"id" => token.id}, %{current_user: user})

      assert deleted["id"] == token.id
    end
  end

  describe "createWebhook" do
    test "A user can create a webhook" do
      user = insert(:user)

      {:ok, %{data: %{"createWebhook" => created}}} = run_query("""
        mutation createWebhook($url: String!) {
          createWebhook(attributes: {url: $url}) {
            id
            url
          }
        }
      """, %{"url" => "https://example.com"}, %{current_user: user})

      assert created["url"] == "https://example.com"
    end
  end

  describe "pingWebhook" do
    test "It will send a POST to the given webhook" do
      user = insert(:user)
      webhook = insert(:webhook, user: user)

      expect(Mojito, :post, fn _, _, payload, _ -> {:ok, %Mojito.Response{status_code: 200, body: payload}} end)

      {:ok, %{data: %{"pingWebhook" => response}}} = run_query("""
        mutation pingWebhook($repo: String!, $id: ID!) {
          pingWebhook(repo: $repo, id: $id) {
            statusCode
            body
          }
        }
      """, %{"repo" => "repo", "id" => webhook.id}, %{current_user: user})
      assert response["body"] == Jason.encode!(%{repository: "repo", message: "webhook ping"})
      assert response["statusCode"] == 200
    end
  end

  describe "externalToken" do
    test "it will issue a limited token for the user" do
      user = insert(:user)
      {:ok, %{data: %{"externalToken" => token}}} = run_query("""
        mutation { externalToken }
      """, %{}, %{current_user: user})

      {:ok, found, _} = Core.Guardian.resource_from_token(token)

      assert found.id == user.id
      assert found.external
    end
  end

  describe "createResetToken" do
    test "it will create a reset token for a user" do
      user = insert(:user)

      {:ok, %{data: %{"createResetToken" => token}}} = run_query("""
        mutation Create($attrs: ResetTokenAttributes!) {
          createResetToken(attributes: $attrs)
        }
      """, %{"attrs" => %{"email" => user.email, "type" => "PASSWORD"}})

      assert token
    end
  end

  describe "realizeResetToken" do
    test "it will realize a pwd reset token" do
      token = insert(:reset_token)

      {:ok, %{data: %{"realizeResetToken" => res}}} = run_query("""
        mutation Realize($id: ID!, $attrs: ResetTokenRealization!) {
          realizeResetToken(id: $id, attributes: $attrs)
        }
      """, %{"id" => token.external_id, "attrs" => %{"password" => "a long password"}})

      assert res
    end
  end

  describe "createPublicKey" do
    test "it can create a key for a user" do
      user = insert(:user)

      {:ok, %{data: %{"createPublicKey" => res}}} = run_query("""
        mutation Create($attributes: PublicKeyAttributes!) {
          createPublicKey(attributes: $attributes) {
            id
            name
            digest
          }
        }
      """, %{"attributes" => %{"content" => "a bogus key", "name" => "example"}}, %{current_user: user})

      assert res["id"]
      assert res["name"] == "example"
      assert res["digest"]
    end
  end

  describe "deletePublicKey" do
    test "it can create a key for a user" do
      user = insert(:user)
      key  = insert(:public_key, user: user)

      {:ok, %{data: %{"deletePublicKey" => res}}} = run_query("""
        mutation Delete($id: ID!) {
          deletePublicKey(id: $id) { id }
        }
      """, %{"id" => key.id}, %{current_user: user})

      assert res["id"] == key.id
      refute refetch(key)
    end
  end

  describe "deviceLogin" do
    test "it will fetch a deviceToken and loginUrl" do
      {:ok, %{data: %{"deviceLogin" => login}}} = run_query("""
        mutation {
          deviceLogin { deviceToken loginUrl }
        }
      """, %{})

      assert login["deviceToken"]
      assert login["loginUrl"]
    end
  end

  describe "deleteEabKey" do
    test "it will delete an eab key for a user" do
      eab = insert(:eab_credential)

      {:ok, %{data: %{"deleteEabKey" => del}}} = run_query("""
        mutation Delete($id: ID!) {
          deleteEabKey(id: $id) { id }
        }
      """, %{"id" => eab.id}, %{current_user: eab.user})

      assert del["id"] == eab.id
      refute refetch(eab)
    end
  end

  describe "deleteUser" do
    setup [:setup_root_user]
    test "it can delete a user", %{account: account, user: admin} do
      user = insert(:user, account: account)

      {:ok, %{data: %{"deleteUser" => del}}} = run_query("""
        mutation Delete($id: ID!) {
          deleteUser(id: $id) { id }
        }
      """, %{"id" => user.id}, %{current_user: admin})

      assert del["id"] == user.id
      refute refetch(user)
    end
  end

  describe "createUserEvent" do
    test "it can create an event for a user" do
      user = insert(:user)

      {:ok, %{data: %{"createUserEvent" => true}}} = run_query("""
        mutation Event($attrs: UserEventAttributes!) {
          createUserEvent(attributes: $attrs)
        }
      """, %{"attrs" => %{"event" => "an.event"}}, %{current_user: user})
    end
  end

  describe "destroyCluster" do
    test "it can trigger a cluster cleanup" do
      user = insert(:user)
      domain = insert(:dns_domain)
      insert_list(3, :dns_record, provider: :aws, cluster: "cluster", creator: user, domain: domain)
      insert(:dns_record, provider: :gcp, domain: domain, creator: user)

      expect(Core.Conduit.Broker, :publish, 3, fn _, _ -> :ok end)

      {:ok, %{data: %{"destroyCluster" => true}}} = run_query("""
        mutation Destroy($name: String!, $domain: String!, $provider: Provider!) {
          destroyCluster(name: $name, domain: $domain, provider: $provider)
        }
      """, %{"name" => "cluster", "domain" => domain.name, "provider" => "AWS"}, %{current_user: user})
    end
  end
end
