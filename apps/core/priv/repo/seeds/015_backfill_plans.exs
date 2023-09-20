import Botanist

seed do
  Core.Services.Payments.backfill_plan_features()
end
