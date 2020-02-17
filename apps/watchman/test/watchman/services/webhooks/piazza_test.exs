defmodule Watchman.Webhooks.Formatter.PiazzaTest do
  use Watchman.DataCase, async: true
  alias Watchman.Webhooks.Formatter.Piazza

  describe "format/1" do
    test "It can format successful builds" do
      build = insert(:build, status: :successful)

      {:ok, %{text: text, structured_message: message}} = Piazza.format(build)

      assert text =~ build.repository
      assert message =~ build.id
      assert message =~ "green"
    end

    test "It can format unsuccessful builds" do
      build = insert(:build, status: :failed)

      {:ok, %{text: text, structured_message: message}} = Piazza.format(build)

      assert text =~ build.repository
      assert message =~ build.id
      assert message =~ "red"
    end
  end
end