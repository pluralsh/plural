defmodule Core.Shell.Models.Git do
  defstruct [:url, :root, :name, :branch]
end

defmodule Core.Shell.Models.Network do
  defstruct [:plural_dns, :subdomain]
end

defmodule Core.Shell.Models.Workspace do
  defstruct [:network, :bucket_prefix, :cluster, :region]

  def as() do
    %__MODULE__{network: %Core.Shell.Models.Network{}}
  end
end


defmodule Core.Shell.Models.Configuration do
  alias Core.Shell.Models.{Workspace, Git}
  defstruct [:workspace, :git, :context_configuration, :buckets, :domains]

  def as() do
    %__MODULE__{
      workspace: Workspace.as(),
      git: %Git{}
    }
  end
end
