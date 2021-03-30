defmodule Rtc.UpgradeBuffer do
  defstruct [:last]

  def new(), do: %__MODULE__{last: nil}

  def append(%__MODULE__{last: nil} = buf, %{id: id}), do: %{buf | last: id}
  def append(%__MODULE__{last: last} = buf, %{id: id}) when id > last,
    do: %{buf | last: id}
  def append(%__MODULE__{} = buf, _), do: buf
end
