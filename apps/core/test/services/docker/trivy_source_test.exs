defmodule Core.Docker.TrivySourceTest do
  use Core.SchemaCase, async: true
  alias Core.Docker.TrivySource

  @example Application.get_env(:core, :vulnerability) |> Jason.decode!()

  describe "#to_vulnerability/1" do
    test "It can convert a trivy json message to a vulnerability map" do
      result = TrivySource.to_vulnerability(@example)

      assert result.vulnerability_id == "CVE-2019-19242"
      assert result.package == "sqlite-libs"
      assert result.installed_version == "3.26.0-r3"
      assert result.fixed_version == "3.28.0-r2"
      assert result.layer == %{
        digest: "sha256:aafecf9bbbfd514858f0d93fa0f65c2d59c8a1c46ec4b55963e42619f00a0a61",
        diff_id: "sha256:fbe16fc07f0d81390525c348fbd720725dcae6498bd5e902ce5d37f2b7eed743"
      }
      assert result.source == "nvd"
      assert result.url == "https://avd.aquasec.com/nvd/cve-2019-19242"
      assert result.title == "sqlite: SQL injection in sqlite3ExprCodeTarget in expr.c"
      assert result.description == "SQLite 3.30.1 mishandles pExpr-\u003ey.pTab, as demonstrated by the TK_COLUMN case in sqlite3ExprCodeTarget in expr.c."
      assert result.severity == :medium
      assert result.score == 5.9
      assert result.cvss == %{
        attack_vector: :network,
        attack_complexity: :high,
        privileges_required: :none,
        user_interaction: :none,
        confidentiality: :none,
        integrity: :none,
        availability: :high
      }
    end
  end
end
