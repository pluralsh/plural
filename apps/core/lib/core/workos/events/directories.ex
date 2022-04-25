defmodule Core.WorkOS.Events.DSyncActivated do
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

defmodule Core.WorkOS.Events.DSyncDeactivated do
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

defmodule Core.WorkOS.Events.DSyncDeleted do
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
