defmodule Plural.Cmd do
  def template(chart, vals),
    do: plural("template", IO.inspect([chart, "--values", vals]))

  defp plural(cmd, args) do
    case System.cmd(plural_cmd(), [cmd | args]) do
      {res, 0} -> {:ok, res}
      {out, _} -> {:error, out}
    end
  end

  defp plural_cmd(), do: Core.conf(:plural_cmd)
end
