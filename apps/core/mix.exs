defmodule Core.MixProject do
  use Mix.Project

  defp version do
    version = git_vsn()
    case Version.parse(version) do
      {:ok, %Version{pre: ["pre" <> _ | _]} = version} ->
        to_string(version)

      {:ok, %Version{pre: []} = version} ->
        to_string(version)

      {:ok, %Version{patch: patch, pre: pre} = version} ->
        to_string(%{version | patch: patch + 1, pre: ["dev" | pre]})

      :error ->
        Mix.shell().error("Failed to parse, falling back to 0.0.0")
        "0.0.0"
    end
  end

  defp git_vsn() do
    case System.cmd("git", ~w[describe --dirty=+dirty]) do
      {version, 0} ->
        String.trim_leading(String.trim(version), "v")

      {_, code} ->
        Mix.shell().error("Git exited with code #{code}, falling back to 0.0.0")

        "0.0.0"
    end
  end

  def project do
    [
      app: :core,
      version: version(),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.16",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [tool: ExCoveralls]
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {Core.Application, []},
      extra_applications: [:logger, :crypto, :porcelain, :ssh]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:sentry, "~> 10.2.0"},
      {:ecto_sql, "~> 3.13"},
      {:libvault, "~> 0.2.0"},
      {:ecto, "~> 3.13", override: true},
      {:postgrex, "~> 0.22"},
      {:ex_machina, "~> 2.7.0", only: :test},
      {:comeonin, "~> 5.3.0"},
      {:argon2_elixir, "~> 4.1"},
      {:piazza_core, "~> 0.3.9", git: "https://github.com/michaeljguarino/piazza_core", commit: "2a91145d0d567f1aab40d52843d77dfb491c424a", override: true},
      {:inet_cidr, "~> 1.0.0"},
      {:dns, "~> 2.4.0"},
      {:bamboo, "~> 2.3"},
      {:parallax, "~> 1.0"},
      {:bourne, "~> 1.1"},
      {:mcp_sse, "~> 0.1.0"},
      {:flow, "~> 1.2"},
      {:gen_stage, "~> 1.0", override: true},
      {:joken, "~> 2.6"},
      {:guardian, "~> 2.4"},
      {:waffle, "~> 1.1"},
      {:waffle_gcs, "~> 0.1"},
      {:waffle_ecto, "~> 0.0"},
      {:porcelain, "~> 2.0"},
      {:ex_aws, "~> 2.7"},
      {:ex_aws_s3, "~> 2.3.3"},
      {:ex_aws_sts, "~> 2.3.0"},
      {:configparser_ex, "~> 5.0"},
      {:sweet_xml, "~> 0.7.3"},
      {:dictionary, "~> 0.1.0"},
      {:mojito, "~> 0.7.0"},
      {:nebulex, "~> 2.6"},
      {:castore, "~> 1.0", override: true},
      {:plug_crypto, "~> 2.2"},
      {:req, "~> 0.7.2", override: true},
      {:mint, "~> 1.6", override: true},
      {:finch, "~> 0.19", override: true},
      {:absinthe_client, "~> 0.1.0"},
      {:kazan, "~> 0.11", github: "michaeljguarino/kazan", ref: "bbeda162b85c5b49a4f044cee92070aa1670a44e"},
      {:workos, "~> 0.1.2"},
      {:decorator, "~> 1.3"},
      {:botanist, "~> 0.1.0", git: "https://github.com/michaeljguarino/botanist.git", branch: "ecto3"},
      {:x509, "~> 0.9.2"},
      {:briefly, "~> 0.5.0"},
      {:yaml_elixir, "~> 2.9"},
      {:timex, "~> 3.7"},
      {:oauth2, "~> 2.1"},
      {:websockex, "~> 0.5.1", override: true},
      {:hackney, "~> 4.0", override: true},
      {:tzdata, "~> 1.1.0", override: true},
      {:prometheus_ex, "~> 3.0"},
      {:stripity_stripe, "3.3.2"},
      {:conduit, "~> 0.12"},
      {:conduit_amqp, "~> 0.6.3"},
      {:amqp, "~> 4.0", override: true},
      {:rabbit_common, "~> 4.0", override: true},
      {:mime, "~> 2.0"},
      {:ex_image_info, "~> 0.2.4"},
      {:instream, "~> 1.0"},
      {:swarm, "~> 3.4.0"},
      {:poison, "~> 6.0", override: true},
      {:cloudflare, "~> 0.2"},
      {:mimic, "~> 1.1", only: :test},
      {:google_api_iam, "~> 0.40"},
      {:recaptcha, "~> 3.0", git: "https://github.com/samueljseay/recaptcha"},
      {:google_api_cloud_resource_manager, "~> 0.41"},
      {:google_api_cloud_billing, "~> 0.23"},
      {:google_api_service_usage, "~> 0.18"},
      {:openid_connect, "~> 0.2.2", git: "https://github.com/pluralsh/openid_connect", commit: "c3b2701b9adbe01fd89bbd09816ffa6c9e4a825e"},
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
