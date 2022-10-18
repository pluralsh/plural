defmodule Core.Services.UsersTest do
  use Core.SchemaCase, async: true
  use Mimic
  alias Core.Services.Users
  alias Core.PubSub

  describe "#create_user" do
    test "Users can be created" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      assert user.name == "some user"
      assert user.email == "something@example.com"
      assert user.password_hash
      assert Timex.after?(user.email_confirm_by, Timex.now())

      %{account: account} = Core.Repo.preload(user, [:account])
      assert account.name == user.email
      assert account.root_user_id == user.id

      assert_receive {:event, %PubSub.UserCreated{item: ^user}}
    end
  end

  describe "#create_publisher" do
    test "Users can create publishers" do
      account = insert(:account)
      user = insert(:user, account: account)
      {:ok, publisher} = Users.create_publisher(%{name: "somepublisher"}, user)

      assert publisher.name == "somepublisher"
      assert publisher.owner_id == user.id
      assert publisher.account_id == account.id
    end
  end

  describe "#update_user/2" do
    test "Users can update themselves" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      {:ok, updated} = Users.update_user(%{name: "real user"}, user)

      assert updated.name == "real user"

      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end

    test "password updates require confirmation" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      {:error, _} = Users.update_user(%{password: "anewstrongpassword", confirm: "whoops"}, user)
      {:ok, _} = Users.update_user(%{password: "anewstrongpassword", confirm: "superstrongpassword"}, user)
    end

    test "email change is properly detected" do
      user = insert(:user)

      {:ok, updated} = Users.update_user(%{name: "changed"}, user)
      refute updated.email_changed

      {:ok, updated} = Users.update_user(%{email: user.email}, user)
      refute updated.email_changed

      {:ok, updated} = Users.update_user(%{email: "changed@example.com"}, user)
      assert updated.email_changed
      refute updated.email_confirmed
    end

    test "you cannot make yourself an admin" do
      user = build(:user)
             |> with_password("superstrongpassword")
             |> insert()

      {:error, _} = Users.update_user(%{name: "real user", roles: %{admin: true}}, user)
    end

    test "users can update their onboarding checklist" do
      onboarding_checklist = %{status: :new, dismissed: false}
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com",
        onboarding_checklist: onboarding_checklist
      })

      {:ok, updated} = Users.update_user(%{onboarding_checklist: %{status: :finished}}, user)

      assert updated.onboarding_checklist.status == :finished
      assert updated.onboarding_checklist.dismissed == onboarding_checklist.dismissed

      assert_receive {:event, %PubSub.UserUpdated{item: ^updated}}
    end
  end

  describe "#update_user/3" do
    test "admins can update users" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })
      %{account: account} = Core.Repo.preload(user, [:account])

      admin = insert(:user, account: account, roles: %{admin: true})

      {:ok, updated} = Users.update_user(%{name: "real user", roles: %{admin: true}}, user.id, admin)

      assert updated.name == "real user"
      refute updated.email_changed
      assert updated.roles.admin

      assert_receive {:event, %PubSub.UserUpdated{item: ^updated, actor: actor}}

      assert actor.id == admin.id
    end

    test "nonadmins cannot update users" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        password: "superstrongpassword",
        email: "something@example.com"
      })

      %{account: account} = Core.Repo.preload(user, [:account])

      nonadmin = insert(:user, account: account)

      {:error, _} = Users.update_user(%{name: "real user", roles: %{admin: true}}, user.id, nonadmin)
    end
  end

  describe "#delete_user" do
    setup [:setup_root_user]
    test "root users can delete users in their accounts", %{account: account, user: user} do
      other_user = insert(:user, account: account)

      {:ok, del} = Users.delete_user(other_user.id, user)

      refute refetch(del)

      assert_receive {:event, %PubSub.UserDeleted{item: ^del, actor: ^user}}
    end

    test "Users with user management perms can delete users", %{account: account} do
      user = insert(:user, account: account)
      role = insert(:role, account: account, permissions: %{users: true})
      insert(:role_binding, role: role, user: user)
      other_user = insert(:user, account: account)

      user = Core.Services.Rbac.preload(user)
      {:ok, _} = Users.delete_user(other_user.id, user)
    end

    test "You cannot delete your own user", %{account: account} do
      user = insert(:user, account: account)
      role = insert(:role, account: account, permissions: %{users: true})
      insert(:role_binding, role: role, user: user)

      user = Core.Services.Rbac.preload(user)
      {:error, _} = Users.delete_user(user.id, user)
    end

    test "You cannot delete an account's root user", %{account: account, user: root} do
      user = insert(:user, account: account)
      role = insert(:role, account: account, permissions: %{users: true})
      insert(:role_binding, role: role, user: user)

      user = Core.Services.Rbac.preload(user)
      {:error, _} = Users.delete_user(root.id, user)
    end
  end

  describe "#update_publisher" do
    test "Users can update their own publisher" do
      user = insert(:user)
      publisher = insert(:publisher, owner: user)

      {:ok, updated} = Users.update_publisher(%{name: "publisher"}, user)

      assert updated.id == publisher.id
      assert updated.name == "publisher"
    end
  end

  describe "#login_method" do
    test "if the login method is passwordless, it will create a passwordless login record" do
      user = insert(:user, login_method: :passwordless)

      {:ok, %{login_method: :passwordless, token: token}} = Users.login_method(user.email)

      assert_receive {:event, %PubSub.PasswordlessLoginCreated{item: item}}

      assert item.user_id == user.id
      assert item.token

      assert Users.get_login_token(token)
    end

    test "if the email is on an sso-enabled domain, it will return an sso login method" do
      insert(:domain_mapping, domain: "example.com", enable_sso: true, workos_connection_id: "conn_id")
      {:ok, %{login_method: :sso, authorize_url: url}} = Users.login_method("someone@example.com")

      assert is_binary(url)
    end

    test "if the user doesn't exist, it will return an error" do
      {:error, :not_found} = Users.login_method("some@email.com")
    end
  end

  describe "#login_user" do
    test "You can log in by password" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        email: "someone@example.com",
        password: "verystrongpassword"
      })

      {:ok, login} = Users.login_user(user.email, "verystrongpassword")

      assert login.id == user.id

      {:error, _} = Users.login_user(user.email, "incorrectpassword")
    end

    test "You cannot password login with a different login method" do
      {:ok, user} = Users.create_user(%{
        name: "some user",
        email: "someone@example.com",
        password: "verystrongpassword",
        login_method: :google
      })

      {:error, _} = Users.login_user(user.email, "verystrongpassword")
    end
  end

  describe "#passwordless_login/1" do
    test "it will return the user if valid" do
      token = insert(:login_token)
      login = insert(:passwordless_login, login_token: token, user: token.user)

      {:ok, user} = Users.passwordless_login(login.token)

      assert user.id == login.user_id
      refute refetch(login)

      assert refetch(token).active
    end

    test "it will return an error if there is no login record" do
      {:error, _} = Users.passwordless_login("bogus")
    end
  end

  describe "#poll_login_token" do
    test "if the token is active, it will return the associated user" do
      token = insert(:login_token, active: true)

      {:ok, user} = Users.poll_login_token(token.token)

      assert user.id == token.user_id
    end

    test "if the token is inactive, it will error" do
      token = insert(:login_token)

      {:error, :inactive} = Users.poll_login_token(token.token)
    end

    test "if the token doesn't exist, it will error" do
      {:error, :not_found} = Users.poll_login_token("bogus")
    end
  end

  describe "#create_persisted_token/1" do
    test "A user can create a persisted token for themselves" do
      user = insert(:user)

      {:ok, %{token: "plrl-" <> _} = token} = Users.create_persisted_token(user)

      assert token.token
      assert token.user_id == user.id
      assert Users.get_persisted_token(token.token)
    end
  end

  describe "#delete_persisted_token" do
    test "A user can delete their tokens" do
      user = insert(:user)
      token = insert(:persisted_token, user: user)

      {:ok, del} = Users.delete_persisted_token(token.id, user)

      assert del.id == token.id
      refute refetch(token)
    end

    test "Users cannot delete other's tokens" do
      user  = insert(:user)
      token = insert(:persisted_token)

      {:error, _} = Users.delete_persisted_token(token.id, user)
    end
  end

  describe "#upsert_webhook/2" do
    test "It can create a new webhook for a url" do
      user = insert(:user)
      url  = "https://www.example.com"

      {:ok, webhook} = Users.upsert_webhook(url, user)

      assert webhook.user_id == user.id
      assert webhook.url == url
      assert webhook.secret
    end

    test "It will echo an existing webhook" do
      %{user: user} = webhook = insert(:webhook)

      {:ok, upserted} = Users.upsert_webhook(webhook.url, user)

      assert upserted.secret == webhook.secret
      assert upserted.url == webhook.url
      assert upserted.user_id == user.id
    end
  end

  describe "#create_reset_token/1" do
    test "it can create a pwd reset token" do
      user = insert(:user)

      {:ok, reset} = Users.create_reset_token(%{
        email: user.email,
        type: :password
      })

      assert reset.user.id == user.id
      assert reset.type == :password
      assert reset.external_id

      assert_receive {:event, %PubSub.ResetTokenCreated{item: ^reset}}
    end

    test "it will fail on invalid emails" do

      {:error, :not_found} = Users.create_reset_token(%{
        email: "invalid@email.com",
        type: :password
      })
    end
  end

  describe "#realize_reset_token/2" do
    test "it can realize a reset token" do
      token = insert(:reset_token)

      {:ok, user} = Users.realize_reset_token(token.external_id, %{password: "a long password"})

      assert user.id == token.user.id

      {:ok, _} = Users.login_user(user.email, "a long password")

      refute refetch(token)
    end

    test "it will confirm an email for email tokens" do
      user = insert(:user)
      token = insert(:reset_token, type: :email, user: user)

      {:ok, reset} = Users.realize_reset_token(token.external_id, %{})

      assert reset.id == token.user.id
      assert reset.email_confirmed

      assert_receive {:event, %PubSub.EmailConfirmed{item: ^reset}}

      refute refetch(token)
    end
  end

  describe "#create_public_key/2" do
    test "it can create a public key for a user" do
      user = insert(:user)

      {:ok, key} = Users.create_public_key(%{content: "bogus key", name: "example"}, user)

      assert key.name == "example"
      assert key.user_id == user.id
      assert key.digest
    end
  end

  describe "#delete_public_key/2" do
    test "it can delete a user's public key" do
      user = insert(:user)
      key = insert(:public_key, user: user)

      {:ok, _} = Users.delete_public_key(key.id, user)

      refute refetch(key)
    end

    test "it cannot delete others' keys" do
      user = insert(:user)
      key = insert(:public_key)

      {:error, _} = Users.delete_public_key(key.id, user)
    end
  end

  describe "#device_login/0" do
    test "it will create a login token and print a url" do
      {:ok, login} = Users.device_login()

       token = Users.get_login_token(login.device_token)
       assert token
       refute token.active

       assert is_binary(login.login_url)
    end
  end

  describe "#activate_login_token/2" do
    test "it will set the login token to active" do
      token = insert(:login_token)
      user  = insert(:user)

      {:ok, active} = Users.activate_login_token(token.token, user)

      assert active.active
      assert active.user_id == user.id
    end
  end

  describe "#get_eab_key/3" do
    test "it will generate and persist an eab keypair for a user" do
      user = insert(:user)
      expect(HTTPoison, :post, fn _, _ ->
        {:ok, %{status_code: 200, body: Jason.encode!(%{
          success: 1,
          eab_kid: "abc",
          eab_hmac_key: "123"
        })}}
      end)

      {:ok, eab} = Users.get_eab_key("cluster", :aws, user)

      assert eab.cluster == "cluster"
      assert eab.provider == :aws
      assert eab.user_id == user.id
      assert eab.key_id == "abc"
      assert eab.hmac_key == "123"
    end
  end

  describe "#delete_eab_key/2" do
    test "a user can delete their eab creds" do
      user = insert(:user)
      eab = insert(:eab_credential, user: user)

      {:ok, _} = Users.delete_eab_key(eab.id, user)

      refute refetch(eab)
    end
  end

  describe "#bootstrap_users/2" do
    test "it will create new users and set login method" do
      {:ok, user} = Users.bootstrap_user(:google, %{email: "someone@gmail.com", name: "New User"})

      assert user.email == "someone@gmail.com"
      assert user.name == "New User"
      assert user.login_method == :google
    end

    test "it will update login method for existing users" do
      user = insert(:user)

      {:ok, upd} = Users.bootstrap_user(:google, %{email: user.email})

      assert upd.id == user.id
      assert upd.login_method == :google
    end
  end

  describe "#backfill_providers/0" do
    test "it will set providers based on terraform installations" do
      user = insert(:user)
      insert(:terraform_installation,
        installation: build(:installation, user: user),
        version: build(:version, dependencies: %{providers: [:gcp]})
      )

      user2 = insert(:user)
      insert(:terraform_installation,
        installation: build(:installation, user: user2),
        version: build(:version, dependencies: %{providers: [:aws]})
      )

      user3 = insert(:user)

      Users.backfill_providers()

      assert refetch(user).provider == :gcp
      assert refetch(user2).provider == :aws
      refute refetch(user3).provider
    end
  end

  describe "#destroy_cluster/2" do
    test "it can destroy all records created by the cluster" do
      me = self()
      user = insert(:user)
      domain = insert(:dns_domain)
      records = insert_list(3, :dns_record, provider: :aws, cluster: "cluster", creator: user, domain: domain)
      insert(:dns_record, provider: :gcp, domain: domain, creator: user)

      expect(Core.Conduit.Broker, :publish, 3, fn %{body: r}, :cluster -> send(me, {:record, r}) end)

      :ok = Users.destroy_cluster(%{name: "cluster", domain: domain.name, provider: :aws}, user)

      for %{id: id} <- records,
        do: assert_receive {:record, %{id: ^id}}
    end
  end
end
