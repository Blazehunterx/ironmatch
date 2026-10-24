defmodule IronMatchWeb.Layouts do
  @moduledoc """
  Tactical Dark OLED (`#050505`) and Electric Lime (`#32FF32`) shell layout
  with reusable vector tier badges and mobile bottom navigation bar.
  """
  use IronMatchWeb, :html

  attr :inner_content, :any, required: true

  def root(assigns) do
    ~H"""
    <!DOCTYPE html>
    <html lang="en" class="dark bg-[#050505] text-white antialiased">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="csrf-token" content={get_csrf_token()} />
        <title>IRONMATCH • Tactical Strength & Gym Network (Elixir OTP)</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/phoenix@1.7.14/priv/static/phoenix.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/phoenix_live_view@0.20.17/priv/static/phoenix_live_view.min.js"></script>
        <script>
          window.addEventListener("DOMContentLoaded", () => {
            let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
            let liveSocket = new window.LiveView.LiveSocket("/live", window.Phoenix.Socket, {
              params: {_csrf_token: csrfToken}
            });
            liveSocket.connect();
            window.liveSocket = liveSocket;
          });
        </script>
      </head>
      <body class="bg-[#050505] text-zinc-100 min-h-screen selection:bg-[#32FF32] selection:text-black">
        <%= @inner_content %>
      </body>
    </html>
    """
  end

  attr :inner_content, :any, required: true
  attr :flash, :map, default: %{}

  def app(assigns) do
    ~H"""
    <div class="max-w-md mx-auto min-h-screen bg-[#050505] border-x border-zinc-900 flex flex-col justify-between pb-20">
      <main class="flex-1 p-4">
        <%= @inner_content %>
      </main>

      <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2.5 flex items-center justify-around z-50">
        <.link navigate={~p"/"} class="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#32FF32]">
          <span>HOME</span>
        </.link>
        <.link navigate={~p"/workouts"} class="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#32FF32]">
          <span>WORKOUTS</span>
        </.link>
        <.link navigate={~p"/arena"} class="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#32FF32]">
          <span>ARENA</span>
        </.link>
        <.link navigate={~p"/messages"} class="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#32FF32]">
          <span>CHAT</span>
        </.link>
        <.link navigate={~p"/profile"} class="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#32FF32]">
          <span>PROFILE</span>
        </.link>
      </nav>
    </div>
    """
  end

  @doc """
  Vector SVG Competitive Tier Badge (Freshman, Contender, Varsity, Vanguard, Titan, Immortal).
  Replaces juvenile cartoon emojis with a clean geometric shield badge.
  """
  attr :tier, :string, default: "Varsity"

  def tier_badge(assigns) do
    ~H"""
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#32FF32]/10 text-[#32FF32] border border-[#32FF32]/30">
      <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 4.5l4.5 1.69v4.4c0 3.12-1.91 6.02-4.5 6.91-2.59-.89-4.5-3.79-4.5-6.91v-4.4L12 6.5z" />
      </svg>
      <%= @tier %>
    </span>
    """
  end
end
