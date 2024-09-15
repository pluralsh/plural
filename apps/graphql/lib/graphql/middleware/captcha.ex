defmodule GraphQl.Middleware.Captcha do
  @behaviour Absinthe.Middleware
  import Absinthe.Resolution, only: [put_result: 2]

  def call(%{arguments: %{captcha: captcha}} = res, _) when is_binary(captcha) do
    case Recaptcha.verify(captcha) do
      {:ok, _} -> res
      _ -> put_result(res, {:error, "captcha validation failed"})
    end
  end
  def call(res, _), do: res
end
