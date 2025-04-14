defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.PlatformPlan do
  def serialize(plan) do
    plan
    |> Map.from_struct()
    |> Map.drop(~w(__meta__)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.PlatformSubscription do
  def serialize(subscription) do
    subscription
    |> Map.from_struct()
    |> Map.drop(~w(__meta__)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.PlatformPlan.Features do
  def serialize(features) do
    features
    |> Map.from_struct()
    |> Map.drop(~w(__meta__)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.Account do
  def serialize(feature) do
    feature
    |> Map.from_struct()
    |> Map.drop(~w(__meta__ icon)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.User do
  def serialize(user) do
    user
    |> Map.from_struct()
    |> Map.drop(~w(__meta__ password_hash password jwt avatar)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.User.Roles do
  def serialize(roles) do
    roles
    |> Map.from_struct()
    |> Map.drop(~w(__meta__)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.ConsoleInstance do
  def serialize(console) do
    console
    |> Map.from_struct()
    |> Map.take(~w(id first_notif_at second_notif_at type name status subdomain url cloud size region cluster owner)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end

defimpl Core.Mcp.Serialization.Proto, for: Core.Schema.CloudCluster do
  def serialize(cluster) do
    cluster
    |> Map.from_struct()
    |> Map.drop(~w(__meta__)a)
    |> Core.Mcp.Serialization.Proto.serialize()
  end
end
