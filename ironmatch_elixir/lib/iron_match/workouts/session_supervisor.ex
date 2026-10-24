defmodule IronMatch.Workouts.SessionSupervisor do
  @moduledoc """
  OTP DynamicSupervisor that spawns and supervises isolated `ActiveSessionServer`
  processes for every live solo or group workout in progress.

  If a user's network connection drops or their LiveView process restarts in a basement
  gym, their `ActiveSessionServer` remains alive in memory with zero lost sets or timers.
  """
  use DynamicSupervisor

  alias IronMatch.Workouts.ActiveSessionServer

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @doc """
  Starts or attaches to an existing `ActiveSessionServer` for `session_id`.
  """
  @spec start_or_get_session(String.t(), map()) :: {:ok, pid()} | {:error, term()}
  def start_or_get_session(session_id, initial_attrs) do
    case Registry.lookup(IronMatch.SessionRegistry, session_id) do
      [{pid, _}] ->
        {:ok, pid}

      [] ->
        spec = {ActiveSessionServer, Map.put(initial_attrs, :session_id, session_id)}

        case DynamicSupervisor.start_child(__MODULE__, spec) do
          {:ok, pid} -> {:ok, pid}
          {:error, {:already_started, pid}} -> {:ok, pid}
          other -> other
        end
    end
  end

  @doc """
  Lists all active workout sessions currently supervised on the node.
  """
  @spec list_active_sessions() :: [map()]
  def list_active_sessions do
    __MODULE__
    |> DynamicSupervisor.which_children()
    |> Enum.flat_map(fn
      {_, pid, :worker, [ActiveSessionServer]} when is_pid(pid) ->
        try do
          [ActiveSessionServer.get_state(pid)]
        catch
          :exit, _ -> []
        end

      _ ->
        []
    end)
  end
end
