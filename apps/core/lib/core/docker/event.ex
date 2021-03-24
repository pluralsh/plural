defmodule Core.Docker.Event do
  alias Core.Docker.{Pull, Push}

  defmacro __using__(_) do
    quote do
      defstruct [:repository, :tag, :digest, :actor]

      def new(%{"repository" => repo, "digest" => digest} = blob, actor \\ nil) do
        %__MODULE__{
          repository: repo,
          tag: blob["tag"],
          digest: digest,
          actor: actor
        }
      end
    end
  end

  def build(%{"events" => events}) when is_list(events) do
    Enum.map(events, &build/1)
    |> Enum.filter(& &1)
  end

  def build(%{"action" => "pull", "target" => target} = event), do: Pull.new(target, event["actor"])
  def build(%{"action" => "push", "target" => target} = event), do: Push.new(target, event["actor"])

  def build(_), do: nil
end

defmodule Core.Docker.Pull, do: use Core.Docker.Event
defmodule Core.Docker.Push, do: use Core.Docker.Event
