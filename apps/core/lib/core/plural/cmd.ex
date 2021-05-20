defmodule Plural.Cmd do
  alias Porcelain.Result

  def template(chart, vals),
    do: plural("template", [chart, "--values", vals])

  defp plural(cmd, args) do
    case Porcelain.exec(plural_cmd(), [cmd | args]) do
      %Result{status: 0, out: res} -> {:ok, res}
      err -> {:error, error_msg(err)}
    end
  end

  defp plural_cmd(), do: Core.conf(:plural_cmd)

  defp error_msg(%Result{out: out, err: err}) when is_binary(err), do: "#{err}\n#{out}"
  defp error_msg(%Result{out: out}), do: out
end
