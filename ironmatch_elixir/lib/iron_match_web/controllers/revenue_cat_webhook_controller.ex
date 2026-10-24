defmodule IronMatchWeb.RevenueCatWebhookController do
  @moduledoc """
  Handles server-to-server webhook notifications from RevenueCat for App Store
  and Google Play Store subscriptions (`ironmatch_pro`).
  """
  use IronMatchWeb, :controller
  alias IronMatch.Billing.RevenueCat

  def create(conn, params) do
    case RevenueCat.handle_webhook_event(params) do
      {:ok, result} ->
        Phoenix.PubSub.broadcast(IronMatch.PubSub, "billing:#{result.user_id}", {:subscription_updated, result})
        json(conn, %{status: "ok", subscription: result})

      {:error, :invalid_payload} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: "Invalid RevenueCat webhook payload"})
    end
  end
end
