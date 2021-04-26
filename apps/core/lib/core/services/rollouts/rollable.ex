defprotocol Core.Rollouts.Rollable do
  def preload(event)

  def name(event)

  def query(event)

  def process(event, record)
end
