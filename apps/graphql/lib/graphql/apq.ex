defmodule GraphQl.APQ do
  use Apq.DocumentProvider,
    json_codec: Jason,
    cache_provider: GraphQl.DocumentCache,
    max_query_size: 16384 #default
end