defmodule IronMatch.Application do
  @moduledoc """
  OTP Application & Supervision Tree for IronMatch.

  Supervises:
  - `IronMatch.Repo`: Ecto PostgreSQL connection pool (Supabase compatible)
  - `IronMatch.PubSub`: Real-time event bus for Live Group Workouts, Spotter Beacons & Duels
  - `IronMatchWeb.Presence`: Distributed tracker for active lifters on the Gym Floor Radar
  - `IronMatch.SessionRegistry`: Process registry mapping workout session IDs to OTP PIDs
  - `IronMatch.Workouts.SessionSupervisor`: DynamicSupervisor spawning isolated GenServers per active workout
  - `IronMatch.Arena.MatchmakerServer`: GenServer managing Ranked Duels, Squads, and Global Whiteboard
  - `IronMatchWeb.Endpoint`: Bandit HTTP / WebSocket LiveView endpoint
  """
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      IronMatchWeb.Telemetry,
      IronMatch.Repo,
      {DNSCluster, query: Application.get_env(:iron_match, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: IronMatch.PubSub},
      IronMatchWeb.Presence,
      {Registry, keys: :unique, name: IronMatch.SessionRegistry},
      IronMatch.Workouts.SessionSupervisor,
      IronMatch.Arena.MatchmakerServer,
      IronMatchWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: IronMatch.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    IronMatchWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
