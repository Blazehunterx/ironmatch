import Config

config :iron_match,
  ecto_repos: [IronMatch.Repo],
  generators: [timestamp_type: :utc_datetime, binary_id: true]

config :iron_match, IronMatchWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: IronMatchWeb.ErrorHTML, json: IronMatchWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: IronMatch.PubSub,
  live_view: [signing_salt: "ironmatch_lv_salt_2026"]

config :tailwind,
  version: "3.4.3",
  iron_match: [
    args: ~w(
      --config=tailwind.config.js
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
