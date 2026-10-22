import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage } from '@revenuecat/purchases-capacitor';

// Public RevenueCat API Keys for App Store & Google Play Store distribution
// Configure these in your RevenueCat Dashboard linked to Google Play Console and App Store Connect
const REVENUECAT_GOOGLE_API_KEY = (import.meta as any).env?.VITE_REVENUECAT_GOOGLE_KEY || 'goog_public_ironmatch_placeholder';
const REVENUECAT_APPLE_API_KEY = (import.meta as any).env?.VITE_REVENUECAT_APPLE_KEY || 'appl_public_ironmatch_placeholder';

let isPurchasesConfigured = false;

/**
 * Initialize native in-app purchases for Google Play Store and Apple App Store
 */
export async function initNativePurchases(userId?: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        console.log('[IAP] Non-native platform detected; running in simulation/preview mode.');
        return false;
    }

    if (isPurchasesConfigured) return true;

    try {
        const platform = Capacitor.getPlatform();
        const apiKey = platform === 'android' ? REVENUECAT_GOOGLE_API_KEY : REVENUECAT_APPLE_API_KEY;

        await Purchases.configure({
            apiKey,
            appUserID: userId || undefined
        });

        isPurchasesConfigured = true;
        console.log(`[IAP] Native ${platform} In-App Billing successfully configured.`);
        return true;
    } catch (err) {
        console.warn('[IAP] Native billing configuration notice:', err);
        return false;
    }
}

export interface IronPassOfferings {
    monthly?: PurchasesPackage | null;
    annual?: PurchasesPackage | null;
    lifetime?: PurchasesPackage | null;
    currencySymbol?: string;
    formattedPrices?: {
        monthly?: string;
        annual?: string;
        lifetime?: string;
    };
}

/**
 * Fetch localized offerings and prices from Google Play Store or App Store
 */
export async function getNativeOfferings(): Promise<IronPassOfferings> {
    if (!Capacitor.isNativePlatform()) {
        return {
            formattedPrices: {
                monthly: '$9.99',
                annual: '$59.99',
                lifetime: '$79.99'
            }
        };
    }

    try {
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;

        if (!currentOffering) {
            return {
                formattedPrices: {
                    monthly: '$9.99',
                    annual: '$59.99',
                    lifetime: '$79.99'
                }
            };
        }

        const monthlyPkg = currentOffering.monthly || null;
        const annualPkg = currentOffering.annual || null;
        const lifetimePkg = currentOffering.lifetime || null;

        return {
            monthly: monthlyPkg,
            annual: annualPkg,
            lifetime: lifetimePkg,
            formattedPrices: {
                monthly: monthlyPkg?.product?.priceString || '$9.99',
                annual: annualPkg?.product?.priceString || '$59.99',
                lifetime: lifetimePkg?.product?.priceString || '$79.99'
            }
        };
    } catch (err) {
        console.warn('[IAP] Could not fetch native store offerings:', err);
        return {
            formattedPrices: {
                monthly: '$9.99',
                annual: '$59.99',
                lifetime: '$79.99'
            }
        };
    }
}

/**
 * Execute native in-app purchase via Google Play Billing or StoreKit
 */
export async function purchaseNativePackage(
    pkgType: 'monthly' | 'annual' | 'lifetime',
    nativePackage?: PurchasesPackage | null
): Promise<{ success: boolean; customerInfo?: any; isPro: boolean; error?: string }> {
    if (!Capacitor.isNativePlatform() || !nativePackage) {
        // Fallback for web preview or test mode
        console.log(`[IAP] Simulating purchase for ${pkgType} in non-native / dev environment`);
        return { success: true, isPro: true };
    }

    try {
        const result = await Purchases.purchasePackage({ aPackage: nativePackage });
        const entitlements = result.customerInfo?.entitlements?.active || {};
        const isPro = !!(entitlements['pro_access'] || entitlements['ironpass_pro'] || entitlements['lifetime']);

        return {
            success: true,
            customerInfo: result.customerInfo,
            isPro
        };
    } catch (err: any) {
        if (err?.userCancelled) {
            console.log('[IAP] User cancelled native store checkout bottom-sheet.');
            return { success: false, isPro: false, error: 'cancelled' };
        }
        console.error('[IAP] Native purchase error:', err);
        return { success: false, isPro: false, error: err?.message || 'Purchase failed' };
    }
}

/**
 * Restore purchases from Google Play Store or App Store account
 * Required by Google Play & Apple App Store review guidelines
 */
export async function restoreNativePurchases(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
    if (!Capacitor.isNativePlatform()) {
        return { success: true, isPro: false };
    }

    try {
        const result = await Purchases.restorePurchases();
        const entitlements = result.customerInfo?.entitlements?.active || {};
        const isPro = !!(entitlements['pro_access'] || entitlements['ironpass_pro'] || entitlements['lifetime']);

        return {
            success: true,
            isPro
        };
    } catch (err: any) {
        console.error('[IAP] Native restore purchases error:', err);
        return { success: false, isPro: false, error: err?.message || 'Restore failed' };
    }
}
