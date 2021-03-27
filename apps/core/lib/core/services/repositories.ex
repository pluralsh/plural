defmodule Core.Services.Repositories do
  use Core.Services.Base
  import Core.Policies.Repository

  alias Core.PubSub
  alias Core.Services.Users
  alias Core.Auth.Jwt
  alias Core.Schema.{
    Repository,
    Installation,
    User,
    DockerRepository,
    DockerImage,
    LicenseToken,
    License,
    Integration,
    Subscription,
    Plan,
    Artifact
  }
  alias Piazza.Crypto.RSA

  @spec get_installation!(binary) :: Installation.t
  def get_installation!(id),
    do: Core.Repo.get!(Installation, id)

  @spec get_installation(binary, binary) :: Installation.t | nil
  def get_installation(user_id, repo_id) do
    Core.Repo.get_by(Installation, repository_id: repo_id, user_id: user_id)
  end

  @spec get_repository!(binary) :: Repository.t
  def get_repository!(id), do: Core.Repo.get(Repository, id)

  @spec get_repository_by_name!(binary) :: Repository.t
  def get_repository_by_name!(name),
    do: Core.Repo.get_by!(Repository, name: name)

  @spec get_repository_by_name(binary) :: Repository.t | nil
  def get_repository_by_name(name),
    do: Core.Repo.get_by(Repository, name: name)

  def get_license_token(token),
    do: Core.Repo.get_by(LicenseToken, token: token)

  def get_artifact(repo_id, name, platform, arch) do
    Core.Repo.get_by(
      Artifact,
      repository_id: repo_id,
      name: name,
      platform: platform,
      arch: arch
    )
  end

  def get_dkr_image!(image_id), do: Core.Repo.get!(DockerImage, image_id)

  @doc """
  Creates a new repository for the user's publisher

  Will throw if there is no publisher
  """
  @spec create_repository(map, User.t) :: {:ok, Repository.t} | {:error, term}
  def create_repository(attrs, %User{} = user) do
    publisher = Users.get_publisher_by_owner!(user.id)

    start_transaction()
    |> add_operation(:repo, fn _ ->
      %Repository{publisher_id: publisher.id}
      |> Repository.changeset(attrs)
      |> Core.Repo.insert()
    end)
    |> add_operation(:licensed, fn %{repo: repo} ->
      generate_keys(repo)
    end)
    |> execute(extract: :licensed)
    |> notify(:create, user)
  end

  @doc """
  Returns the list of docker accesses available for `user` against the
  given repository
  """
  @spec authorize_docker(binary, User.t) :: [:push | :pull]
  def authorize_docker(repo_name, %User{} = user) do
    repo = get_repository_by_name!(repo_name) |> Core.Repo.preload([:publisher])

    Parallax.new()
    |> Parallax.operation(:push, fn -> allow(repo, user, :edit) end)
    |> Parallax.operation(:pull, fn -> allow(repo, user, :pull) end)
    |> Parallax.execute()
    |> Enum.filter(fn
      {_, {:ok, _}} -> true
      _ -> false
    end)
    |> Enum.map(&elem(&1, 0))
  end

  @doc """
  Persists a given docker image with the given tag.  Called by the docker
  registry notification webhook.
  """
  @spec create_docker_image(binary, binary, binary, User.t) :: {:ok, DockerImage.t} | {:error, term}
  def create_docker_image(repo, tag, digest, user) do
    [cm_repo | rest] = String.split(repo, "/")
    cm_repo = get_repository_by_name!(cm_repo)

    start_transaction()
    |> add_operation(:repo, fn _ ->
      Enum.join(rest, "/")
      |> upsert_docker_repo(cm_repo)
    end)
    |> add_operation(:image, fn %{repo: repo} ->
      upsert_image(tag, digest, repo)
    end)
    |> execute()
    |> notify(:create, user)
  end

  @doc """
  Appends vulnerabilities to a docker image
  """
  @spec add_vulnerabilities(list, Image.t) :: {:ok, DockerImage.t} | {:error, term}
  def add_vulnerabilities(vulns, image) do
    Core.Repo.preload(image, [:vulnerabilities])
    |> DockerImage.vulnerability_changeset(%{
      vulnerabilities: vulns,
      scanned_at: Timex.now(),
      grade: grade(vulns)
    })
    |> Core.Repo.update()
  end

  defp grade(vulns) when is_list(vulns) do
    vulns
    |> Enum.reduce(%{}, fn %{severity: severity}, acc ->
      Map.update(acc, severity, 0, & &1 + 1)
    end)
    |> case do
      %{critical: _} -> :f
      %{high: _} -> :d
      %{medium: _} -> :c
      %{low: _} -> :b
      _ -> :a
    end
  end
  defp grade(_), do: :a

  defp upsert_docker_repo(name, %Repository{id: id}) do
    case Core.Repo.get_by(DockerRepository, repository_id: id, name: name) do
      nil -> %DockerRepository{repository_id: id, name: name}
      %DockerRepository{} = repo -> repo
    end
    |> DockerRepository.changeset()
    |> Core.Repo.insert_or_update()
  end

  defp upsert_image(nil, _, _), do: {:ok, nil}
  defp upsert_image(tag, digest, %DockerRepository{id: id}) do
    case Core.Repo.get_by(DockerImage, docker_repository_id: id, tag: tag) do
      nil -> %DockerImage{docker_repository_id: id, tag: tag}
      %DockerImage{} = repo -> repo
    end
    |> DockerImage.changeset(%{digest: digest})
    |> Core.Repo.insert_or_update()
  end

  @doc """
  Constructs a docker-compliant jwt for the given repo and scopes.
  """
  @spec docker_token([binary | atom], binary, User.t) :: {:ok, binary} | {:error, term}
  def docker_token(scopes, repo_name, user) do
    signer = Jwt.signer()
    access = [%{"type" => "repository", "name" => repo_name, "actions" => scopes}]
    with {:ok, claims} <- Jwt.generate_claims(%{"sub" => user.email, "access" => access}),
         {:ok, token, _} <- Jwt.encode_and_sign(claims, signer),
      do: {:ok, token}
  end


  @doc """
  Constructs a dummy jwt for user on docker login
  """
  @spec dkr_login_token(User.t) :: {:ok, binary} | {:error, term}
  def dkr_login_token(user) do
    signer = Jwt.signer()
    with {:ok, claims} <- Jwt.generate_claims(%{"sub" => user.email, "access" => []}),
         {:ok, token, _} <- Jwt.encode_and_sign(claims, signer),
      do: {:ok, token}
  end

  @doc """
  Updates the given repository.

  Fails if the user is not the publisher
  """
  @spec update_repository(map, binary, User.t) :: {:ok, Repository.t} | {:error, term}
  def update_repository(attrs, repo_id, %User{} = user) do
    get_repository!(repo_id)
    |> Core.Repo.preload([:integration_resource_definition, :tags, :dashboards, :shell, :database])
    |> Repository.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Deletes the repository.  This might be deprecated as it's inherently unsafe.

  Fails if the user is not the publisher.
  """
  def delete_repository(repo_id, %User{} = user) do
    get_repository!(repo_id)
    |> allow(user, :edit)
    |> when_ok(:delete)
  end

  @doc """
  Creates or updates the given integration for the repo.

  Fails if the user is not the publisher
  """
  @spec upsert_integration(map, binary, User.t) :: {:ok, Integration.t} | {:error, term}
  def upsert_integration(%{name: name} = attrs, repo_id, %User{} = user) do
    repo = get_repository!(repo_id) |> Core.Repo.preload([:integration_resource_definition])
    pub  = Users.get_publisher_by_owner(user.id)
    case Core.Repo.get_by(Integration, name: name, repository_id: repo_id) do
      %Integration{} = int -> Core.Repo.preload(int, [:tags])
      _ -> %Integration{repository_id: repo_id, name: name, publisher_id: pub && pub.id}
    end
    |> Integration.changeset(Map.put(attrs, :publisher_id, pub && pub.id))
    |> Integration.validate(repo.integration_resource_definition)
    |> allow(user, :edit)
    |> when_ok(&Core.Repo.insert_or_update/1)
  end

  @doc """
  Creates a new installation for a repository for the given user
  """
  @spec create_installation(map, binary, User.t) :: {:ok, Installation.t} | {:error, term}
  def create_installation(attrs, repository_id, %User{} = user) do
    %Installation{repository_id: repository_id, user_id: user.id}
    |> Installation.changeset(Map.put_new(attrs, :context, %{}))
    |> allow(user, :create)
    |> when_ok(:insert)
    |> notify(:create, user)
  end

  @doc """
  Updates the given installation.

  Fails if the user is not the original installer.
  """
  @spec update_installation(map, binary, User.t) :: {:ok, Installation.t} | {:error, term}
  def update_installation(attrs, inst_id, %User{} = user) do
    get_installation!(inst_id)
    |> Installation.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(:update)
    |> notify(:update, user)
  end

  @doc """
  Deletes the given installation.  If there is also a subscription, will delete it as well.

  Fails if the user is not the installer.
  """
  @spec delete_installation(binary | Installation.t, User.t) :: {:ok, Installation.t} | {:error, term}
  def delete_installation(%Installation{} = installation, %User{} = user) do
    start_transaction()
    |> add_operation(:subscription, fn _ ->
      Core.Repo.preload(installation, [:subscription])
      |> case do
        %{subscription: %Subscription{} = sub} ->
          Core.Services.Payments.cancel_subscription(sub, user)
        _ -> {:ok, nil}
      end
    end)
    |> add_operation(:installation, fn _ ->
      installation
      |> allow(user, :edit)
      |> when_ok(:delete)
    end)
    |> execute(extract: :installation)
  end
  def delete_installation(inst_id, user), do: get_installation!(inst_id) |> delete_installation(user)

  @doc """
  Creates a new artifact for the repository, representing a downloadable resource
  like a cli, desktop app, etc.

  Fails if the user is not the publisher
  """
  @spec create_artifact(map, binary, User.t) :: {:ok, Artifact.t} | {:error, term}
  def create_artifact(%{name: name, platform: plat} = attrs, repository_id, %User{} = user) do
    attrs = Map.put_new(attrs, :arch, "amd64")

    get_artifact(repository_id, name, plat, attrs.arch)
    |> case do
      %Artifact{} = art -> art
      _ -> %Artifact{repository_id: repository_id}
    end
    |> Artifact.changeset(attrs)
    |> allow(user, :edit)
    |> when_ok(&Core.Repo.insert_or_update/1)
  end

  @doc """
  Generates a refresh token for the license, constructs the policy given
  the current subscription (or free if there are no plans configured).

  Fails if the installation has no suscription but the repository has
  plans available.
  """
  @spec generate_license(Installation.t) :: {:ok, binary | nil}
  def generate_license(%Installation{} = installation) do
    %{repository: repo} = installation =
      Core.Repo.preload(installation, [:repository, [subscription: :plan]])

    with {:ok, %{token: token}} <- upsert_license_token(installation),
         {:ok, policy} <- mk_policy(installation, Core.Services.Payments.has_plans?(repo.id)) do
      License.new(policy: policy, refresh_token: token, secrets: repo.secrets)
      |> Jason.encode!()
      |> RSA.encrypt(ExPublicKey.loads!(repo.private_key))
    else
      _ -> {:ok, nil}
    end
  end

  defp mk_policy(%Installation{subscription: %Subscription{line_items: %{items: items}, plan: plan} = sub}, _) do
    limits = Enum.into(items, %{}, fn %{dimension: dim} ->
      {dim, Subscription.dimension(sub, dim)}
    end)
    features = Plan.features(plan)
    {:ok, %{limits: limits, features: features, plan: plan.name, free: false}}
  end
  defp mk_policy(_, false), do: {:ok, %{free: true}}
  defp mk_policy(_, _), do: :error

  @doc """
  Constructs a new license file with the given license token.
  """
  @spec refresh_license(LicenseToken.t) :: {:ok, binary} | {:error, :not_found}
  def refresh_license(%LicenseToken{installation: %Installation{} = installation}),
    do: generate_license(installation)
  def refresh_license(token) when is_binary(token) do
    Core.Repo.get_by!(LicenseToken, token: token)
    |> Core.Repo.preload([:installation])
    |> refresh_license()
  end
  def refresh_license(_), do: {:error, :not_found}

  @doc """
  Generates an rsa key pair and persists it to the repository
  """
  @spec generate_keys(Repository.t) :: {:ok, Repository.t} | {:error, term}
  def generate_keys(%Repository{} = repo) do
    with {:ok, keypair} <- RSA.generate_keypair(),
         {:ok, {priv, pub}} <- RSA.pem_encode(keypair) do
      repo
      |> Repository.key_changeset(%{private_key: priv, public_key: pub})
      |> Core.Repo.update()
    end
  end

  @doc """
  Self-explanatory
  """
  @spec upsert_license_token(Installation.t) :: {:ok, LicenseToken.t} | {:error, term}
  def upsert_license_token(%Installation{id: id}) do
    case Core.Repo.get_by(LicenseToken, installation_id: id) do
      %LicenseToken{} = token -> token
      nil -> %LicenseToken{}
    end
    |> LicenseToken.changeset(%{installation_id: id})
    |> Core.Repo.insert_or_update()
  end

  @doc """
  Returns whether a user can `:access` the repository.
  """
  @spec authorize(binary, User.t) :: {:ok, Repository.t} | {:error, term}
  def authorize(repo_id, %User{} = user) when is_binary(repo_id) do
    get_repository!(repo_id)
    |> authorize(user)
  end
  def authorize(%Repository{} = repo, user),
    do: allow(repo, user, :access)

  defp notify({:ok, %Installation{} = inst}, :create, user),
    do: handle_notify(PubSub.InstallationCreated, inst, actor: user)
  defp notify({:ok, %Installation{} = inst}, :update, user),
    do: handle_notify(PubSub.InstallationUpdated, inst, actor: user)

  defp notify({:ok, %Repository{} = repo}, :create, user),
    do: handle_notify(PubSub.RepositoryCreated, repo, actor: user)
  defp notify({:ok, %Repository{} = repo}, :update, user),
    do: handle_notify(PubSub.RepositoryUpdated, repo, actor: user)

  defp notify({:ok, %{image: %DockerImage{} = img}} = res, :create, user) do
    handle_notify(PubSub.DockerImageCreated, img, actor: user)
    res
  end

  defp notify(pass, _, _), do: pass
end
