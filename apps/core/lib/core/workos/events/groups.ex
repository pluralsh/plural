defmodule Core.WorkOS.Events.GroupCreated do
  import Core.WorkOS.Events.Base

  defstruct [:group, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      group: group(data),
      directory_id: dir_id,
    }
  end
end

defmodule Core.WorkOS.Events.GroupUpdated do
  import Core.WorkOS.Events.Base

  defstruct [:group, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      group: group(data),
      directory_id: dir_id,
    }
  end
end


defmodule Core.WorkOS.Events.GroupDeleted do
  import Core.WorkOS.Events.Base

  defstruct [:group, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      group: group(data),
      directory_id: dir_id,
    }
  end
end

defmodule Core.WorkOS.Events.GroupUserDeleted do
  import Core.WorkOS.Events.Base

  defstruct [:group, :user, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      group: group(data["group"]),
      user: user(data["user"]),
      directory_id: dir_id,
    }
  end
end


defmodule Core.WorkOS.Events.GroupUserCreated do
  import Core.WorkOS.Events.Base

  defstruct [:group, :user, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      group: group(data["group"]),
      user: user(data["user"]),
      directory_id: dir_id,
    }
  end
end
