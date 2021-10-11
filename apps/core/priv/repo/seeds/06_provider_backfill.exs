import Botanist

seed do
  Core.Services.Users.backfill_providers()
end
