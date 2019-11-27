defmodule Core.Docker.Event do
  alias Core.Docker.{Pull, Push}

  defmacro __using__(_) do
    quote do
      defstruct [:repository, :tag, :digest]

      def new(%{"repository" => repo, "digest" => digest} = blob) do
        %__MODULE__{
          repository: repo,
          tag: blob["tag"],
          digest: digest
        }
      end
    end
  end

  def build(%{"events" => events}) when is_list(events) do
    Enum.map(events, &build/1)
    |> Enum.filter(& &1)
  end
  def build(%{"action" => "pull", "target" => target}), do: Pull.new(target)
  def build(%{"action" => "push", "target" => target}), do: Push.new(target)
  def build(_), do: nil
end

defmodule Core.Docker.Pull, do: use Core.Docker.Event
defmodule Core.Docker.Push, do: use Core.Docker.Event