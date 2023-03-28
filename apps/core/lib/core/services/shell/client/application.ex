defmodule Core.Shell.Client.ApplicationSpec do
  defmodule Link do
    defstruct [:url, :description]
  end

  defmodule Descriptor do
    defstruct [:version, :description, :links]
  end

  defstruct [:descriptor]

  def spec() do
    %__MODULE__{descriptor: %Descriptor{links: [%Link{}]}}
  end
end

defmodule Core.Shell.Client.ApplicationStatus do
  defmodule Condition do
    defstruct [:message, :status, :type, :reason]
  end

  defmodule Component do
    defstruct [:group, :kind, :name, :status]
  end

  defstruct [:componentsReady, :conditions, :components]

  def spec() do
    %__MODULE__{
      conditions: [%Condition{}],
      components: [%Component{}]
    }
  end
end

defmodule Core.Shell.Client.Application do
  alias Core.Shell.Client.{ApplicationSpec, ApplicationStatus}

  defmodule Metadata do
    defstruct [:name, :namespace]
  end

  @type t :: %__MODULE__{}

  defstruct [:spec, :status, :metadata]

  def ready?(%__MODULE__{status: %ApplicationStatus{conditions: [_ | _] = condition}}) do
    Enum.any?(condition, fn
      %{type: "Ready", status: "True"} -> true
      _ -> false
    end)
  end
  def ready?(_), do: false

  def spec() do
    %__MODULE__{
      metadata: %Metadata{},
      spec: ApplicationSpec.spec(),
      status: ApplicationStatus.spec()
    }
  end
end
