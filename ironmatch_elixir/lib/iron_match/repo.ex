defmodule IronMatch.Repo do
  use Ecto.Repo,
    otp_app: :iron_match,
    adapter: Ecto.Adapters.Postgres
end
