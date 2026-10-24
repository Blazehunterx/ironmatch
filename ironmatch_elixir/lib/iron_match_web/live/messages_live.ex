defmodule IronMatchWeb.MessagesLive do
  @moduledoc """
  Phoenix LiveView for Real-Time Direct & Squad Messaging over `Phoenix.PubSub`,
  featuring 1-Tap Icebreaker Quick-Connect chips so athletes never face a blank inbox.
  """
  use IronMatchWeb, :live_view

  @topic "chat:facility"

  @icebreakers [
    %{
      partner: "Marcus Vance (Titan • 635kg SBD)",
      prompt: "Yo Marcus — saw you're on the floor at Iron Paradise. Down to work in on heavy squats or spot my top set?"
    },
    %{
      partner: "Elena Rostova (Vanguard • 425kg SBD)",
      prompt: "Hey Elena! Hitting pulls at 18:00 today — let's run the Friday Squad Whiteboard WOD together."
    },
    %{
      partner: "06:00 Dawn Patrol Squad Chat",
      prompt: "Morning crew — rack 2 is open. Who's hitting the 4x8 Bench + Weighted Chin-up block today?"
    }
  ]

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(IronMatch.PubSub, @topic)
    end

    {:ok,
     assign(socket,
       icebreakers: @icebreakers,
       active_partner: "Marcus Vance (Titan • 635kg SBD)",
       messages: [
         %{
           sender: "Marcus Vance",
           body: "Rack 1 is free right now if you want to rotate in on squats.",
           time: "Just now"
         }
       ],
       draft: ""
     )}
  end

  @impl true
  def handle_event("send_icebreaker", %{"partner" => partner, "prompt" => prompt}, socket) do
    msg = %{sender: "You", body: prompt, time: "Just now"}
    Phoenix.PubSub.broadcast(IronMatch.PubSub, @topic, {:new_message, partner, msg})
    {:noreply, assign(socket, active_partner: partner, messages: socket.assigns.messages ++ [msg])}
  end

  @impl true
  def handle_event("send_message", %{"body" => body}, socket) do
    trimmed = String.trim(body)

    if trimmed != "" do
      msg = %{sender: "You", body: trimmed, time: "Just now"}
      Phoenix.PubSub.broadcast(IronMatch.PubSub, @topic, {:new_message, socket.assigns.active_partner, msg})
      {:noreply, assign(socket, messages: socket.assigns.messages ++ [msg], draft: "")}
    else
      {:noreply, socket}
    end
  end

  @impl true
  def handle_info({:new_message, partner, msg}, socket) do
    if msg.sender == "You" do
      {:noreply, socket}
    else
      {:noreply, assign(socket, active_partner: partner, messages: socket.assigns.messages ++ [msg])}
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-4">
      <div class="border-b border-zinc-800 pb-3">
        <span class="text-[10px] font-black uppercase tracking-widest text-[#32FF32]">PUBSUB REAL-TIME COMMS</span>
        <h1 class="text-xl font-black uppercase">ATHLETE & SQUAD COMMS</h1>
      </div>

      <!-- 1-Tap Icebreaker Quick-Connect Chips -->
      <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
        <div class="text-[10px] font-black uppercase text-[#32FF32]">
          1-TAP QUICK-CONNECT • ACTIVE GYM PARTNERS
        </div>
        <div class="space-y-2">
          <%= for item <- @icebreakers do %>
            <div class="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-black text-white"><%= item.partner %></div>
                <div class="text-[11px] text-zinc-400 line-clamp-1"><%= item.prompt %></div>
              </div>
              <button
                phx-click="send_icebreaker"
                phx-value-partner={item.partner}
                phx-value-prompt={item.prompt}
                class="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#32FF32] text-black text-[10px] font-black uppercase"
              >
                SEND
              </button>
            </div>
          <% end %>
        </div>
      </div>

      <!-- Active Conversation Thread -->
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div class="text-xs font-black uppercase text-[#32FF32] border-b border-zinc-800 pb-2">
          THREAD: <%= @active_partner %>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <%= for m <- @messages do %>
            <div class={[
              "p-2.5 rounded-xl text-xs max-w-[85%]",
              if(m.sender == "You",
                do: "ml-auto bg-[#32FF32] text-black font-bold",
                else: "bg-zinc-800 text-zinc-100"
              )
            ]}>
              <div class="text-[9px] uppercase opacity-70 font-black"><%= m.sender %> • <%= m.time %></div>
              <div><%= m.body %></div>
            </div>
          <% end %>
        </div>

        <form phx-submit="send_message" class="flex gap-2 pt-2">
          <input
            type="text"
            name="body"
            value={@draft}
            placeholder="Coordinate sets, spotter, or WOD time..."
            class="flex-1 px-3 py-2 rounded-lg bg-black border border-zinc-700 text-xs text-white focus:border-[#32FF32] focus:outline-none"
          />
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-[#32FF32] text-black text-xs font-black uppercase"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
    """
  end
end
