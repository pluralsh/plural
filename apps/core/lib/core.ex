defmodule Core do
  @moduledoc nil
  require Logger

  @chars String.codepoints("abcdefghijklmnopqrstuvwxyz")

  def priv_file!(filename) do
    :code.priv_dir(:core)
    |> Path.join(filename)
    |> File.read!()
  end

  def conf(key), do: Application.get_env(:core, key)

  def env(var, :int, default) do
    case System.get_env(var) do
      "" -> default
      v when is_binary(v) -> String.to_integer(v)
      _ -> default
    end
  end

  def env(var, :bool, default) do
    case System.get_env(var) do
      "1" -> true
      "0" -> false
      "true" -> true
      "false" -> false
      _ -> default
    end
  end

  def random_phrase(len, sep \\ "-") do
    Enum.map(0..len, fn _ -> Dictionary.random_word() end)
    |> Enum.join(sep)
  end

  def drain_config(), do: Application.get_env(:core, :connection_draining) || []

  def broker(), do: conf(:broker)

  def url(path), do: "#{conf(:host)}#{path}"

  def pause(val, seconds) do
    :timer.sleep(:timer.seconds(seconds))
    val
  end

  def random_string(len \\ 32) do
    :crypto.strong_rand_bytes(len)
    |> Base.url_encode64()
    |> String.replace("/", "")
  end

  def random_alphanum(len) do
    Enum.map((1..len), fn _ -> Enum.random(@chars) end)
    |> Enum.join("")
  end

  def sha(str) do
    :crypto.hash(:sha256, str)
    |> Base.encode32()
  end

  def local_cache(key, fun) do
    with nil <- Process.get(key) do
      res = fun.()
      Process.put(key, res)
      res
    end
  end

  def retry(fun, attempts \\ 0)
  def retry(fun, 4), do: fun.()
  def retry(fun, attempts) do
    case fun.() do
      :ok -> :ok
      {:ok, res} -> {:ok, res}
      {:error, _} = error ->
        Logger.info "failed to execute function, error: #{inspect(error)}"
        :timer.sleep(200)
        retry(fun, attempts + 1)
    end
  end

  def throttle(enum, opts \\ %{count: 30, pause: 1})
  def throttle(enum, opts) when is_list(opts), do: throttle(enum, Map.new(opts))
  def throttle(enum, %{count: count, pause: pause}) do
    Stream.with_index(enum)
    |> Stream.map(fn {r, ind} ->
      if rem(ind, count) == 0 do
        :timer.sleep(pause)
      end

      r
    end)
  end
end
