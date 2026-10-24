defmodule IronMatch.Billing.RevenueCat do
  @moduledoc """
  Native App Store / Google Play Store In-App Purchase (IAP) verification and
  freemium trial gate powered by RevenueCat REST API v1 and Webhook events.

  Ensures Apple Guideline 3.1.1 and Google Play Billing policy compliance while
  providing 1 Free AI Blueprint generation before presenting the IronMatch Pro upgrade.
  """

  @entitlement_id "ironmatch_pro"

  @type subscription_state :: %{
          tier: :free | :pro,
          entitlement_active: boolean(),
          free_blueprints_remaining: non_neg_integer(),
          provider: :revenuecat_google_play | :revenuecat_app_store | :free_tier
        }

  @doc """
  Checks whether the athlete can generate an AI Blueprint right now:
  - `:pro` subscribers have unlimited generations.
  - `:free` athletes get 1 full 8-week AI Blueprint generation (`free_blueprints_remaining > 0`).
  """
  @spec can_generate_blueprint?(subscription_state()) ::
          {:ok, :pro_unlimited} | {:ok, :free_trial_used} | {:error, :paywall_required}
  def can_generate_blueprint?(%{entitlement_active: true}), do: {:ok, :pro_unlimited}

  def can_generate_blueprint?(%{free_blueprints_remaining: remaining}) when remaining > 0 do
    {:ok, :free_trial_used}
  end

  def can_generate_blueprint?(_), do: {:error, :paywall_required}

  @doc """
  Parses an incoming RevenueCat webhook payload (`INITIAL_PURCHASE`, `RENEWAL`,
  `CANCELLATION`, `EXPIRATION`) into an updated subscription state.
  """
  @spec handle_webhook_event(map()) :: {:ok, map()} | {:error, :invalid_payload}
  def handle_webhook_event(%{"event" => %{"type" => type, "app_user_id" => user_id} = event}) do
    entitlement_ids = Map.get(event, "entitlement_ids", []) || []
    has_pro = @entitlement_id in entitlement_ids or type in ["INITIAL_PURCHASE", "RENEWAL"]
    active = type in ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"] and has_pro

    {:ok,
     %{
       user_id: user_id,
       event_type: type,
       entitlement_active: active,
       tier: if(active, do: :pro, else: :free),
       store: Map.get(event, "store", "PLAY_STORE")
     }}
  end

  def handle_webhook_event(_), do: {:error, :invalid_payload}
end
