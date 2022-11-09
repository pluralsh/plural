defmodule Core.Factory do
  use ExMachina.Ecto, repo: Core.Repo
  alias Core.Schema

  def user_factory do
    %Schema.User{
      name: "Some user",
      email: sequence(:user, & "user-#{&1}@example.com"),
      account: build(:account)
    }
  end

  def publisher_factory do
    %Schema.Publisher{
      name: sequence(:publisher, & "publisher-#{&1}"),
      owner: build(:user)
    }
  end

  def account_factory do
    %Schema.Account{
      name: sequence(:account, & "account-#{&1}")
    }
  end

  def group_factory do
    %Schema.Group{
      name: sequence(:group, & "group-#{&1}"),
      account: build(:account)
    }
  end

  def group_member_factory do
    %Schema.GroupMember{
      group: build(:group),
      user: build(:user)
    }
  end

  def role_factory do
    %Schema.Role{
      name: sequence(:role, & "role-#{&1}"),
      permissions: %{billing: true, users: true},
      account: build(:account)
    }
  end

  def role_binding_factory do
    %Schema.RoleBinding{
      role: build(:role)
    }
  end

  def invite_factory do
    %Schema.Invite{
      secure_id: sequence(:invite, & "secure-#{&1}"),
      account: build(:account)
    }
  end

  def repository_factory do
    %Schema.Repository{
      name: sequence(:repository, &"repo-#{&1}"),
      publisher: build(:publisher),
      category: :data,
    }
  end

  def chart_factory do
    %Schema.Chart{
      repository: build(:repository),
      name: sequence(:chart, & "chart-#{&1}"),
      latest_version: "0.1.0"
    }
  end

  def terraform_factory do
    %Schema.Terraform{
      repository: build(:repository),
      name: sequence(:terraform, &"tf-#{&1}"),
      latest_version: "0.1.0"
    }
  end

  def version_factory do
    %Schema.Version{
      chart: build(:chart),
      version: "0.1.0"
    }
  end

  def installation_factory do
    %Schema.Installation{
      repository: build(:repository),
      user: build(:user),
      license_key: sequence(:installation, & "key-#{&1}"),
    }
  end

  def chart_installation_factory do
    %Schema.ChartInstallation{
      chart: build(:chart),
      version: build(:version),
      installation: build(:installation)
    }
  end

  def terraform_installation_factory do
    %Schema.TerraformInstallation{
      terraform: build(:terraform),
      installation: build(:installation)
    }
  end

  def persisted_token_factory do
    %Schema.PersistedToken{
      token: sequence(:token, &"plrl-#{&1}"),
      user: build(:user)
    }
  end

  def docker_repository_factory do
    %Schema.DockerRepository{
      name: sequence(:dkr_repo, &"dkr-#{&1}"),
      repository: build(:repository)
    }
  end

  def docker_image_factory do
    %Schema.DockerImage{
      tag: sequence(:dkr_img, &"image-#{&1}"),
      digest: "sha:98ae8321",
      docker_repository: build(:docker_repository)
    }
  end

  def license_token_factory do
    %Schema.LicenseToken{
      token: sequence(:license_token, &"license-#{&1}"),
      installation: build(:installation)
    }
  end

  def webhook_factory do
    %Schema.Webhook{
      url: sequence(:webhook, &"https://url-#{&1}.com"),
      secret: sequence(:webhook, &"secret-#{&1}"),
      user: build(:user)
    }
  end

  def recipe_factory do
    %Schema.Recipe{
      name: sequence(:recipe, &"recipe-#{&1}"),
      repository: build(:repository)
    }
  end

  def recipe_section_factory do
    %Schema.RecipeSection{
      recipe: build(:recipe),
      repository: build(:repository),
      index: 0
    }
  end

  def recipe_item_factory do
    %Schema.RecipeItem{
      recipe_section: build(:recipe_section)
    }
  end

  def recipe_dependency_factory do
    %Schema.RecipeDependency{
      recipe: insert(:recipe),
      dependent_recipe: insert(:recipe),
    }
  end

  def resource_definition_factory do
    %Schema.ResourceDefinition{
      name: sequence(:resource_def, &"resource-definition-#{&1}"),
    }
  end

  def specification_factory do
    %Schema.ResourceDefinition.Specification{}
  end

  def integration_factory do
    %Schema.Integration{
      name: sequence(:integration, &"intg-#{&1}"),
      repository: build(:repository)
    }
  end

  def tag_factory do
    %Schema.Tag{
      tag: sequence(:tags, &"tag-#{&1}"),
      resource_type: :integration
    }
  end

  def plan_factory do
    %Schema.Plan{
      name: sequence(:plan, &"plan-#{&1}"),
      repository: build(:repository),
      cost: 100
    }
  end

  def subscription_factory do
    %Schema.Subscription{
      installation: build(:installation),
      plan: build(:plan)
    }
  end

  def version_tag_factory do
    %Schema.VersionTag{
      version: build(:version),
      chart: build(:chart),
      tag: sequence(:vt, &"tag-#{&1}")
    }
  end

  def incident_factory do
    %Schema.Incident{
      title: "wtf",
      repository: build(:repository),
      creator: build(:user),
      severity: 3,
      status: :open
    }
  end

  def incident_message_factory do
    %Schema.IncidentMessage{
      text: "message",
      incident: build(:incident),
      creator: build(:user)
    }
  end

  def reaction_factory do
    %Schema.Reaction{
      message: build(:incident_message),
      name: "smile",
      creator: build(:user)
    }
  end

  def file_factory do
    %Schema.File{
      message: build(:incident_message),
      media_type: :image,
      filesize: 100
    }
  end

  def incident_history_factory do
    %Schema.IncidentHistory{
      action: :edit,
      changes: [%{key: "title", prev: "something", next: "else"}],
      actor: build(:user),
      incident: build(:incident)
    }
  end

  def follower_factory do
    %Schema.Follower{
      incident: build(:incident),
      user: build(:user)
    }
  end

  def notification_factory do
    %Schema.Notification{
      type: :message,
      user: build(:user),
      actor: build(:user),
    }
  end

  def message_entity_factory do
    %Schema.MessageEntity{
      type: :mention,
      text: "something",
      user: build(:user)
    }
  end

  def integration_webhook_factory do
    %Schema.IntegrationWebhook{
      name: sequence(:int_webhook, & "webhook-#{&1}"),
      account: build(:account),
      secret: "example-secret",
      url: "https://example.com",
      actions: ["incident.create"]
    }
  end

  def webhook_log_factory do
    %Schema.WebhookLog{
      state: :sending,
      status: 0,
      attempts: 0,
      response: "OK",
      webhook: build(:integration_webhook)
    }
  end

  def oauth_integration_factory do
    %Schema.OAuthIntegration{
      account: build(:account),
      service: :zoom,
      access_token: "at",
      refresh_token: "rt",
      expires_at: Timex.now() |> Timex.shift(hours: 1)
    }
  end

  def vulnerability_factory do
    %Schema.Vulnerability{
      image: build(:docker_image),
      vulnerability_id: "CVE-123"
    }
  end

  def audit_factory do
    %Schema.Audit{
      action: "repository:created",
      actor: build(:user),
      account: build(:account),
      repository: build(:repository)
    }
  end

  def upgrade_queue_factory do
    %Schema.UpgradeQueue{
      name: sequence(:queue, &"cluster-#{&1}"),
      user: build(:user)
    }
  end

  def upgrade_factory do
    %Schema.Upgrade{
      queue: build(:upgrade_queue),
      repository: build(:repository)
    }
  end

  def reset_token_factory do
    %Schema.ResetToken{
      user: build(:user),
      type: :password,
      external_id: sequence(:reset_token, &"tok_#{&1}")
    }
  end

  def image_dependency_factory do
    %Schema.ImageDependency{
      image: build(:docker_image),
      version: build(:version)
    }
  end

  def rollout_factory do
    %Schema.Rollout{
      repository: build(:repository)
    }
  end

  def impersonation_policy_factory do
    %Schema.ImpersonationPolicy{
      user: build(:user)
    }
  end

  def impersonation_policy_binding_factory do
    %Schema.ImpersonationPolicyBinding{
      policy: build(:impersonation_policy)
    }
  end

  def public_key_factory do
    %Schema.PublicKey{
      user: build(:user),
      name: sequence(:public_key, &"key-#{&1}"),
      content: sequence(:public_key, &"dummy-key-#{&1}")
    }
  end

  def deferred_update_factory do
    %Schema.DeferredUpdate{
      user: build(:user),
      version: build(:version),
      dequeue_at: Timex.now()
    }
  end

  def access_token_audit_factory do
    %Schema.AccessTokenAudit{
      token: build(:persisted_token),
      ip: "1.2.3.4",
      timestamp: Timex.now()
    }
  end

  def passwordless_login_factory do
    %Schema.PasswordlessLogin{
      user: build(:user),
      token: sequence(:passworless, &"login-#{&1}")
    }
  end

  def oidc_provider_factory do
    %Schema.OIDCProvider{
      installation: build(:installation),
      client_id: sequence(:oidc, &"id-#{&1}"),
      client_secret: sequence(:oidc, &"id-#{&1}")
    }
  end

  def oidc_provider_binding_factory do
    %Schema.OIDCProviderBinding{
      provider: build(:oidc_provider)
    }
  end

  def oidc_login_factory do
    %Schema.OIDCLogin{
      account: build(:account),
      user: build(:user),
      provider: build(:oidc_provider),
    }
  end

  def login_token_factory do
    %Schema.LoginToken{
      token: sequence(:login_token, &"lt-#{&1}"),
      user: build(:user)
    }
  end

  def dns_domain_factory do
    %Schema.DnsDomain{
      name: sequence(:domain, & "some-#{&1}.onplural.sh"),
      creator: build(:user),
      account: build(:account)
    }
  end

  def dns_record_factory do
    %Schema.DnsRecord{
      name: sequence(:record, & "some-#{&1}.domain.onplural.sh"),
      creator: build(:user),
      domain: build(:dns_domain, name: "domain.onplural.sh"),
      cluster: "cluster",
      provider: :aws,
      type: :a,
      records: ["1.2.3.4"],
      external_id: sequence(:external_id, & "ext-#{&1}")
    }
  end

  def dns_access_policy_factory do
    %Schema.DnsAccessPolicy{
      domain: build(:dns_domain)
    }
  end

  def dns_access_policy_binding_factory do
    %Schema.DnsAccessPolicyBinding{
      policy: build(:dns_access_policy)
    }
  end

  def eab_credential_factory do
    %Schema.EabCredential{
      user: build(:user),
      cluster: sequence(:eab, &"cluster-#{&1}"),
      provider: :aws,
      key_id: "abc",
      hmac_key: "123"
    }
  end

  def apply_lock_factory do
    %Schema.ApplyLock{
      lock: "dummy",
      repository: build(:repository)
    }
  end

  def domain_mapping_factory do
    %Schema.DomainMapping{
      account: build(:account),
      domain: sequence(:domain_mapping, & "domain-#{&1}.com")
    }
  end

  def cloud_shell_factory do
    %Schema.CloudShell{
      user: build(:user),
      pod_name: sequence(:pod_name, & "plrl-shell-#{&1}")
    }
  end

  def test_factory do
    %Schema.Test{
      creator: build(:user),
      repository: build(:repository),
      status: :queued,
      promote_tag: "warm",
      source_tag: "latest",
    }
  end

  def test_step_factory do
    %Schema.TestStep{
      name: sequence(:test_step, & "step-#{&1}"),
      test: build(:test),
      status: :queued,
      description: "description"
    }
  end

  def test_binding_factory do
    %Schema.TestBinding{
      test: build(:test),
      version: build(:version)
    }
  end

  def account_organization_factory do
    %Schema.AccountOrganization{
      account: build(:account),
      organization_id: sequence(:ao, & "ao_#{&1}")
    }
  end

  def account_directory_factory do
    %Schema.AccountDirectory{
      account: build(:account),
      directory_id: sequence(:ad, & "ad_#{&1}")
    }
  end

  def demo_project_factory do
    %Schema.DemoProject{
      user: build(:user),
      state: :created,
      project_id: sequence(:dp, &"proj-#{&1}")
    }
  end

  def stack_factory do
    %Schema.Stack{
      account: build(:account),
      creator: build(:user),
      name: sequence(:stack, &"name-#{&1}")
    }
  end

  def stack_collection_factory do
    %Schema.StackCollection{
      provider: :aws
    }
  end

  def stack_recipe_factory do
    %Schema.StackRecipe{
      collection: build(:stack_collection),
      recipe: build(:recipe),
    }
  end

  def key_backup_factory do
    %Schema.KeyBackup{
      name: sequence(:kb, &"backup-#{&1}"),
      vault_path: sequence(:kb_vault, &"/path/to/#{&1}"),
      user: build(:user)
    }
  end

  def with_password(%Schema.User{} = user, password) do
    Schema.User.changeset(user, %{password: password})
    |> Ecto.Changeset.apply_changes()
  end
end
