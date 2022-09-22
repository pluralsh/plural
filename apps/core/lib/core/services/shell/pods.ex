defmodule Core.Services.Shell.Pods do
  alias Kazan.Apis.Core.V1, as: CoreV1
  alias Kazan.Models.Apimachinery.Meta.V1, as: MetaV1

  @image "gcr.io/pluralsh/plural-cli-cloud:0.5.6"
  @busybox_img "gcr.io/pluralsh/busybox:latest"
  @ns "plrl-shell"
  @conditions ~w(Initialized Ready ContainersReady PodScheduled)

  defmodule Status, do: defstruct [:initialized, :ready, :containers_ready, :pod_scheduled]

  def fetch(name) do
    CoreV1.read_namespaced_pod!(@ns, name)
    |> Kazan.run()
  end

  def create(name, email) do
    pod(name, email)
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

  def status(%CoreV1.Pod{status: %CoreV1.PodStatus{conditions: [_ | _] = conditions}}) do
    by_type = condition_map(conditions)
    %Status{
      initialized: status_active(by_type["Initialized"]),
      ready: status_active(by_type["Ready"]),
      containers_ready: status_active(by_type["ContainersReady"]),
      pod_scheduled: status_active(by_type["PodScheduled"]),
    }
  end
  def status(_), do: %Status{}

  def liveness(%CoreV1.Pod{status: %CoreV1.PodStatus{conditions: [_ | _] = conditions}}) do
    by_type = condition_map(conditions)
    Enum.all?(@conditions, &status_active(by_type[&1]))
  end
  def liveness(_), do: false

  defp status_active(%{status: "True"}), do: true
  defp status_active(_), do: false

  defp condition_map(conditions),
    do: Enum.into(conditions, %{}, fn %{type: t} = condition -> {t, condition} end)

  def pod(name, email) do
    %CoreV1.Pod{
      metadata: %MetaV1.ObjectMeta{
        name: name,
        namespace: @ns,
        annotations: %{"platform.plural.sh/expire-after" => "6h", "platform.plural.sh/shell-email" => email},
        labels: %{"app.plural.sh/type" => "shell"}
      },
      spec: %CoreV1.PodSpec{
        containers: [container()],
        init_containers: [init_container()],
        node_selector: %{"platform.plural.sh/instance-class" => "shell"},
        tolerations: [%CoreV1.Toleration{
          key: "platform.plural.sh/taint",
          value: "SHELL",
          operator: "Equal"
        }],
        termination_grace_period_seconds: 30,
        automount_service_account_token: false, # this *MUST* be set to prevent kubectl from using in-cluster auth
      }
    }
  end

  def init_container() do
    %CoreV1.Container{
      name: "limits",
      image: @busybox_img,
      security_context: %CoreV1.SecurityContext{privileged: true},
      command: ["sh", "-c", "ulimit -u 100"]
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
      ],
      resources: %CoreV1.ResourceRequirements{
        limits: %{cpu: "500m", memory: "1Gi"},
        requests: %{cpu: "50m", memory: "150Mi"}
      },
      env: [
        %CoreV1.EnvVar{name: "IGNORE_IN_CLUSTER", value: "true"},
        %CoreV1.EnvVar{name: "CLOUD_SHELL", value: "1"},
      ],
      liveness_probe: healthcheck(),
      readiness_probe: healthcheck(),
    }
  end

  defp healthcheck() do
    %CoreV1.Probe{
      http_get: %CoreV1.HTTPGetAction{
        path: "/v1/health",
        port: "http"
      },
      initial_delay_seconds: 5,
    }
  end
end
