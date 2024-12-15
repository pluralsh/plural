defmodule Core.Services.Cloud.Scram do
  alias Plug.Crypto.KeyGenerator
  @salt_size 16
  @digest_len 32
  @iterations 4096

  def encrypt(pwd) do
    salt   = :crypto.strong_rand_bytes(@salt_size)
    pbkdf  = KeyGenerator.generate(pwd, salt, iterations: @iterations, length: @digest_len)
    client = :crypto.mac(:hmac, :sha256, pbkdf, "Client Key")
    stored = :crypto.hash(:sha256, client)
    server = :crypto.mac(:hmac, :sha256, pbkdf, "Server Key")
    "SCRAM-SHA-256$#{@iterations}:#{Base.encode64(salt)}$#{Base.encode64(stored)}:#{Base.encode64(server)}"
  end
end
