defmodule Core.WorkOS.Event do
  alias Core.WorkOS.Events.{
    ConnectionActivated,
    ConnectionDeactivated,
    ConnectionDeleted,
    DSyncActivated,
    DSyncDeactivated,
    DSyncDeleted,
    UserCreated,
    UserUpdated,
    GroupCreated,
    GroupUpdated,
    GroupDeleted,
    GroupUserCreated,
    GroupUserDeleted,
  }

  def parse(%{"event" => "connection.activated", "data" => data}),
    do: ConnectionActivated.build(data)
  def parse(%{"event" => "connection.deactivated", "data" => data}),
    do: ConnectionDeactivated.build(data)
  def parse(%{"event" => "connection.deleted", "data" => data}),
    do: ConnectionDeleted.build(data)
  def parse(%{"event" => "dsync.activated", "data" => data}),
    do: DSyncActivated.build(data)
  def parse(%{"event" => "dsync.deactivated", "data" => data}),
    do: DSyncDeactivated.build(data)
  def parse(%{"event" => "dsync.deleted", "data" => data}),
    do: DSyncDeleted.build(data)
  def parse(%{"event" => "dsync.user.created", "data" => data}),
    do: UserCreated.build(data)
  def parse(%{"event" => "dsync.user.updated", "data" => data}),
    do: UserUpdated.build(data)
  def parse(%{"event" => "dsync.group.created", "data" => data}),
    do: GroupCreated.build(data)
  def parse(%{"event" => "dsync.group.updated", "data" => data}),
    do: GroupUpdated.build(data)
  def parse(%{"event" => "dsync.group.deleted", "data" => data}),
    do: GroupDeleted.build(data)
  def parse(%{"event" => "dsync.group.user_added", "data" => data}),
    do: GroupUserCreated.build(data)
  def parse(%{"event" => "dsync.group.user_removed", "data" => data}),
    do: GroupUserDeleted.build(data)
  def parse(_), do: nil
end
