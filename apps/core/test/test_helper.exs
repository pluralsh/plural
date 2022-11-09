ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Core.Repo, :manual)
Mimic.copy(Mojito)
Mimic.copy(HTTPoison)
Mimic.copy(Stripe.Connect.OAuth)
Mimic.copy(Stripe.Customer)
Mimic.copy(Stripe.Plan)
Mimic.copy(Stripe.Token)
Mimic.copy(Stripe.Subscription)
Mimic.copy(Stripe.SubscriptionItem)
Mimic.copy(Stripe.SubscriptionItem.Usage)
Mimic.copy(Stripe.Card)
Mimic.copy(Core.Conduit.Broker)
Mimic.copy(Core.Buffers.Docker)
Mimic.copy(Core.Buffers.TokenAudit)
Mimic.copy(Core.Clients.Hydra)
Mimic.copy(Cloudflare.DnsRecord)
Mimic.copy(Kazan)
Mimic.copy(Goth.Token)
Mimic.copy(GoogleApi.CloudBilling.V1.Api.Projects)
Mimic.copy(GoogleApi.CloudResourceManager.V3.Api.Projects)
Mimic.copy(GoogleApi.CloudResourceManager.V3.Api.Operations)
Mimic.copy(GoogleApi.IAM.V1.Api.Projects)
Mimic.copy(GoogleApi.CloudBilling.V1.Api.BillingAccounts)
Mimic.copy(GoogleApi.ServiceUsage.V1.Api.Services)
Mimic.copy(GoogleApi.ServiceUsage.V1.Api.Operations)
Mimic.copy(OAuth2.Client)
Mimic.copy(Core.OAuth.Github)
Mimic.copy(Core.Services.Shell.Pods)
Mimic.copy(Vault)

{:ok, _} = Application.ensure_all_started(:ex_machina)
