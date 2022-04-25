defmodule Core.WorkOS.Events.ConnectionActivated do
  import Core.WorkOS.Events.Base

  defstruct [:organization_id, :id, :domains]

  def build(data) do
    %__MODULE__{
      id: data["id"],
      organization_id: data["organization_id"],
      domains: domains(data["domains"])
    }
  end
end

defmodule Core.WorkOS.Events.ConnectionDeactivated do
  import Core.WorkOS.Events.Base

  defstruct [:organization_id, :id, :domains]

  def build(data) do
    %__MODULE__{
      id: data["id"],
      organization_id: data["organization_id"],
      domains: domains(data["domains"])
    }
  end
end

defmodule Core.WorkOS.Events.ConnectionDeleted do
  import Core.WorkOS.Events.Base

  defstruct [:organization_id, :id, :domains]

  def build(data) do
    %__MODULE__{
      id: data["id"],
      organization_id: data["organization_id"],
      domains: domains(data["domains"])
    }
  end
end
