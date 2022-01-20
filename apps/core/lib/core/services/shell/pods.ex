defmodule Core.Services.Shell.Pods do
  alias Kazan.Apis.Core.V1, as: CoreV1
  alias Kazan.Models.Apimachinery.Meta.V1, as: MetaV1

  @image "gcr.io/pluralsh/plural-cli:0.1.1-cloud"
  @ns "plrl-shell"
  @conditions ~w(Initialized Ready ContainersReady PodScheduled)

  def fetch(name) do
    CoreV1.read_namespaced_pod!(@ns, name)
    |> Kazan.run()
  end

  def create(name) do
    pod(name)
    |> CoreV1.create_namespaced_pod!(@ns)
    |> Kazan.run()
  end

  def delete(name) do
    %MetaV1.DeleteOptions{}
    |> CoreV1.delete_namespaced_pod!(@ns, name)
    |> Kazan.run()
  end

  def ip(name) do
    with {:ok, %CoreV1.Pod{status: %CoreV1.PodStatus{pod_ip: ip}}} <- fetch(name),
      do: {:ok, ip}
  end

  def conditions(), do: @conditions

  def liveness(%CoreV1.Pod{status: %CoreV1.PodStatus{conditions: [_ | _] = conditions}}) do
    by_type = Enum.into(conditions, %{}, fn %{type: t} = condition -> {t, condition} end)
    Enum.all?(@conditions, & (by_type[&1] && by_type[&1].status == "True"))
  end
  def liveness(_), do: false

  def pod(name) do
    %CoreV1.Pod{
      metadata: %MetaV1.ObjectMeta{
        name: name,
        namespace: @ns,
        annotations: %{"platform.plural.sh/expire-after" => "1d"},
        labels: %{"app.plural.sh/type" => "shell"}
      },
      spec: %CoreV1.PodSpec{containers: [container()]}
    }
  end

  defp container() do
    %CoreV1.Container{
      name: "shell",
      image: @image,
      image_pull_policy: "Always",
      ports: [
        %CoreV1.ContainerPort{
          container_port: 8080,
          name: "http"
        }
      ]
    }
  end
end
