import Config

config :iron_match, IronMatch.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "iron_match_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :iron_match, IronMatchWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "ironmatch_dev_secret_key_base_at_least_64_bytes_long_for_phoenix_liveview_otp"

config :logger, :console, format: "[$level] $message\n"
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
