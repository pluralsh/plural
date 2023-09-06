defmodule Core.Services.Shell.Pods do
  alias Kazan.Apis.Core.V1, as: CoreV1
  alias Kazan.Models.Apimachinery.Meta.V1, as: MetaV1

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
    runtime = cri(email)
    containers = [container(runtime) | (if runtime == "sysbox-runc", do: [dind_container()], else: [])]

    %CoreV1.Pod{
      metadata: %MetaV1.ObjectMeta{
        name: name,
        namespace: @ns,
        annotations: Map.merge(
          %{"platform.plural.sh/expire-after" => "6h", "platform.plural.sh/shell-email" => email},
          annotations(runtime)
        ),
        labels: %{"app.plural.sh/type" => "shell"}
      },
      spec: %CoreV1.PodSpec{
        runtime_class_name: runtime,
        containers: containers,
        init_containers: [init_container()],
        node_selector: node_selector(runtime),
        tolerations: [toleration(runtime)],
        termination_grace_period_seconds: 30,
        volumes: volumes(runtime),
        automount_service_account_token: false, # this *MUST* be set to prevent kubectl from using in-cluster auth
      }
    }
  end

  defp annotations("sysbox-runc"), do: %{"io.kubernetes.cri-o.userns-mode" => "auto:size=65536"}
  defp annotations(_), do: %{}

  defp node_selector("sysbox-runc"), do: %{"sysbox-runtime" => "running"}
  defp node_selector(_), do: %{"platform.plural.sh/instance-class" => "shell"}

  defp toleration("sysbox-runc") do
    %CoreV1.Toleration{
      value: "true",
      key: "plural.sh/sysbox",
      operator: "Equal"
    }
  end
  defp toleration(_) do
    %CoreV1.Toleration{
      value: "SHELL",
      key: "platform.plural.sh/taint",
      operator: "Equal"
    }
  end

  def new_cri?(email) do
    case Core.conf(:sysbox_emails) do
      ["*"] -> true
      [_ | _] = emails -> if email in emails, do: true, else: false
      _ -> false
    end
  end

  defp cri(email) do
    case Core.conf(:sysbox_emails) do
      ["*"] -> "sysbox-runc"
      [_ | _] = emails -> if email in emails, do: "sysbox-runc", else: nil
      _ -> nil
    end
  end

  def init_container() do
    %CoreV1.Container{
      name: "limits",
      image: @busybox_img,
      security_context: %CoreV1.SecurityContext{privileged: true},
      command: ["sh", "-c", "ulimit -u 100"]
    }
  end

  defp container(runtime) do
    %CoreV1.Container{
      name: "shell",
      image: image(runtime),
      image_pull_policy: "Always",
      ports: [
        %CoreV1.ContainerPort{
          container_port: 8080,
          name: "http"
        }
      ],
      lifecycle: %CoreV1.Lifecycle{
        pre_stop: %CoreV1.LifecycleHandler{
          http_get: %CoreV1.HTTPGetAction{path: "/v1/shutdown", port: "http"}
        },
      },
      resources: %CoreV1.ResourceRequirements{
        limits: %{cpu: "500m", memory: "1Gi"},
        requests: %{cpu: "50m", memory: "150Mi"}
      },
      env: [
        %CoreV1.EnvVar{name: "IGNORE_IN_CLUSTER", value: "true"},
        %CoreV1.EnvVar{name: "CLOUD_SHELL", value: "1"},
        %CoreV1.EnvVar{name: "DOCKER_HOST", value: "tcp://localhost:2375"}
      ],
      liveness_probe: healthcheck(),
      readiness_probe: healthcheck(),
    }
  end

  defp dind_container() do
    %CoreV1.Container{
      name: "dind",
      image: dind_image(),
      resources: %CoreV1.ResourceRequirements{
        requests: %{cpu: "50m", memory: "512Mi"},
        limits: %{cpu: "500m", memory: "2Gi"},
      },
      security_context: %CoreV1.SecurityContext{privileged: false},
      volume_mounts: [%CoreV1.VolumeMount{name: "docker", mount_path: "/var/lib/docker"}]
    }
  end

  defp volumes("sysbox-runc"), do: [%CoreV1.Volume{name: "docker", empty_dir: %CoreV1.EmptyDirVolumeSource{}}]
  defp volumes(_), do: []

  defp healthcheck() do
    %CoreV1.Probe{
      http_get: %CoreV1.HTTPGetAction{
        path: "/v1/health",
        port: "http"
      },
      initial_delay_seconds: 5,
    }
  end

  defp image(runtime \\ nil)
  defp image("sysbox" <> _), do: Core.conf(:cloud_shell_sysbox_img) || "ghcr.io/pluralsh/plural-cli-cloud:sha-3a8c1fe"
  defp image(_), do: Core.conf(:cloud_shell_img) || "gcr.io/pluralsh/plural-cli-cloud:0.7.3"

  defp dind_image(), do: Core.conf(:dind_img) || "ghcr.io/pluralsh/plural-dind:pr-428"
end
