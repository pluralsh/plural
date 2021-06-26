defmodule GraphQl.Schema.Docker do
  use GraphQl.Schema.Base
  alias GraphQl.Middleware.Accessible
  alias GraphQl.Resolvers.{
    Repository,
    Docker,
    Metrics
  }
  alias Core.Schema.Vulnerability

  ecto_enum :image_grade,      Core.Schema.DockerImage.Grade
  ecto_enum :vuln_grade,       Vulnerability.Grade
  ecto_enum :vuln_vector,      Vulnerability.Vector
  ecto_enum :vuln_requirement, Vulnerability.Requirement

  object :docker_repository do
    field :id,         non_null(:id)
    field :name,       non_null(:string)
    field :repository, :repository, resolve: dataloader(Repository)

    field :metrics, list_of(:metric) do
      arg :tag,       :string
      arg :precision, :string
      arg :offset,    :string

      resolve &Metrics.resolve_docker/2
    end

    timestamps()
  end

  object :docker_image do
    field :id,          non_null(:id)
    field :tag,         :string
    field :digest,      non_null(:string)
    field :scanned_at,  :datetime
    field :grade,       :image_grade

    field :docker_repository, :docker_repository, resolve: dataloader(Docker)
    field :vulnerabilities,   list_of(:vulnerability), resolve: dataloader(Docker)

    timestamps()
  end

  object :image_dependency do
    field :id,      non_null(:id)
    field :image,   non_null(:docker_image), resolve: dataloader(Docker)
    field :version, non_null(:version), resolve: dataloader(Version)

    timestamps()
  end

  object :vulnerability do
    field :id,                non_null(:id)
    field :title,             :string
    field :description,       :string
    field :vulnerability_id,  :string
    field :package,           :string
    field :installed_version, :string
    field :fixed_version,     :string
    field :source,            :string
    field :url,               :string
    field :severity,          :vuln_grade
    field :score,             :float
    field :cvss,              :cvss
    field :layer,             :image_layer

    timestamps()
  end

  object :image_layer do
    field :digest,  :string
    field :diff_id, :string
  end

  object :cvss do
    field :attack_vector,       :vuln_vector
    field :attack_complexity,   :vuln_grade
    field :privileges_required, :vuln_grade
    field :user_interaction,    :vuln_requirement
    field :confidentiality,     :vuln_grade
    field :integrity,           :vuln_grade
    field :availability,        :vuln_grade
  end

  connection node_type: :docker_repository
  connection node_type: :docker_image

  object :docker_queries do
    connection field :docker_repositories, node_type: :docker_repository do
      middleware Authenticated
      middleware Accessible
      arg :repository_id, non_null(:id)

      resolve &Docker.list_repositories/2
    end

    connection field :docker_images, node_type: :docker_image do
      middleware Authenticated
      arg :docker_repository_id, non_null(:id)

      resolve &Docker.list_images/2
    end

    field :docker_image, :docker_image do
      middleware Authenticated
      arg :id, non_null(:id)

      resolve &Docker.resolve_image/2
    end
  end

  object :docker_mutations do

  end
end
