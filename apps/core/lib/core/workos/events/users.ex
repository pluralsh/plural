defmodule Core.WorkOS.Events.UserCreated do
  import Core.WorkOS.Events.Base

  defstruct [:user, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      user: user(data),
      directory_id: dir_id
    }
  end
end

defmodule Core.WorkOS.Events.UserUpdated do
  import Core.WorkOS.Events.Base

  defstruct [:user, :directory_id]

  def build(%{"directory_id" => dir_id} = data) do
    %__MODULE__{
      user: user(data),
      directory_id: dir_id
    }
  end
end
