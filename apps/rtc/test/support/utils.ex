defmodule Rtc.TestUtils do
  def jwt(user) do
    {:ok, token, _} = Core.Guardian.encode_and_sign(user)
    "Bearer #{token}"
  end
end
