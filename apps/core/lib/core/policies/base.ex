defmodule Core.Policies.Base do
  @moduledoc """
  Simple composable policy, each policy should be of the form:

  ```
  can?(user, resource, action) -> :continue, {:error, "reason"}, :pass
  ```

  Policies can then be composed like:
  ```
  import Core.Policy.SomeModel
  ...
  allow(resource, user, [action]) -> {:ok, resource} | {:error, error}
  ```
  """
  defmacro __using__(_) do
    quote do
      import Core.Policies.Base
      import Ecto.Changeset, only: [apply_changes: 1]

      def allow(resource, user, action) when is_atom(action),
        do: allow(resource, user, [action])
      def allow(resource, user, actions),
        do: resolve_policy(__MODULE__, resource, user, actions)
    end
  end

  # TODO: parallelize policy resolutions
  def resolve_policy(_, resource, _, []), do: {:ok, resource}
  def resolve_policy(policy_module, resource, user, [next | actions]) do
    {inferred, action} = infer_resource_and_action(next, resource)
    case policy_module.can?(user, inferred, action) do
      :continue -> resolve_policy(policy_module, resource, user, actions)
      {:error, reason} -> {:error, reason}
      :pass -> {:ok, resource}
    end
  end

  def find_resource(%Ecto.Changeset{valid?: true} = cs), do: {:ok, Ecto.Changeset.apply_changes(cs)}
  def find_resource(%Ecto.Changeset{} = cs), do: {:error, cs}
  def find_resource(resource), do: {:ok, resource}

  defp infer_resource_and_action({resource, action}, _), do: {resource, action}
  defp infer_resource_and_action(action, resource), do: {resource, action}
end