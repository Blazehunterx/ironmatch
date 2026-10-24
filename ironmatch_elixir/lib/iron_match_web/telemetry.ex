defmodule IronMatchWeb.Telemetry do
  @moduledoc """
  Telemetry supervisor monitoring Phoenix endpoint latency, LiveView mount/event times,
  and BEAM VM memory / process metrics.
  """
  use Supervisor
  import Telemetry.Metrics

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl true
  def init(_arg) do
    children = [
      {:telemetry_poller, measurements: periodic_measurements(), period: 10_000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  def metrics do
    [
      summary("phoenix.endpoint.stop.duration", unit: {:native, :millisecond}),
      summary("phoenix.router_dispatch.stop.duration", tags: [:route], unit: {:native, :millisecond}),
      summary("phoenix.live_view.mount.stop.duration", unit: {:native, :millisecond}),
      summary("phoenix.live_view.handle_event.stop.duration", tags: [:event], unit: {:native, :millisecond}),
      summary("vm.memory.total", unit: {:byte, :kilobyte}),
      summary("vm.total_run_queue_lengths.total")
    ]
  end

  defp periodic_measurements do
    []
  end
end
