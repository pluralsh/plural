defmodule Core do
  @moduledoc nil

  def conf(key), do: Application.get_env(:core, key)

  def broker(), do: conf(:broker)

  def url(path), do: "#{conf(:host)}#{path}"

  def pause(val, seconds) do
    :timer.sleep(:timer.seconds(seconds))
    val
  end

  def sha(str) do
    :crypto.hash(:sha256, str)
    |> Base.encode32()
  end

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
