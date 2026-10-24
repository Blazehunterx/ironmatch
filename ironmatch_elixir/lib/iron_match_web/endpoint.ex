defmodule IronMatchWeb.Endpoint do
  @moduledoc """
  Phoenix Endpoint handling HTTP/2, WebSocket LiveView connections, and real-time
  Gym Floor Radar channels.
  """
  use Phoenix.Endpoint, otp_app: :iron_match

  @session_options [
    store: :cookie,
    key: "_iron_match_key",
    signing_salt: "ironmatch_salt_v1",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: [connect_info: [session: @session_options]]

  socket "/socket", IronMatchWeb.UserSocket,
    websocket: true,
    longpoll: false

  plug Plug.Static,
    at: "/",
    from: :iron_match,
    gzip: false,
    only: IronMatchWeb.static_paths()

  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug IronMatchWeb.Router
end
