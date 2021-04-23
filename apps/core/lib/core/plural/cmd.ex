defmodule Plural.Cmd do
  def template(chart, vals),
    do: plural("template", [chart, "--values", vals])

  defp plural(cmd, args) do
    case System.cmd("plural", [cmd | args]) do
      {res, 0} -> {:ok, res}
      {out, _} -> {:error, out}
    end
  end
end
