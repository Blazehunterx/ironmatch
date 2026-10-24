import Config

config :iron_match, IronMatch.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "iron_match_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

config :iron_match, IronMatchWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "ironmatch_test_secret_key_base_at_least_64_bytes_long_for_exunit_verification",
  server: false

config :logger, level: :warning
config :phoenix, :plug_init_mode, :runtime
