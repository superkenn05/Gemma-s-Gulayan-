
import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// For cost control and performance
setGlobalOptions({ maxInstances: 10, region: "us-central1" });

/**
 * Creates a PayMongo Checkout Session
 * This is a secure server-side function to hide the Secret Key.
 * Important: The Secret Key is fetched from Firebase Secrets.
 */
export const createCheckoutSession = onCall({
  secrets: ["PAYMONGO_SECRET_KEY"] 
}, async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { items, email, firstName, lastName, phoneNumber } = request.data;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "Items array is required and cannot be empty.");
  }

  // Retrieve the secret key from the secret manager.
  // NEVER hardcode the sk_test_... or sk_live_... key here.
  const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
  
  if (!SECRET_KEY) {
    logger.error("PAYMONGO_SECRET_KEY is not set in environment variables.");
    throw new HttpsError("failed-precondition", "Payment gateway is not configured. Please set the PAYMONGO_SECRET_KEY in Firebase Functions.");
  }

  const authHeader = "Basic " + Buffer.from(SECRET_KEY + ":").toString("base64");

  logger.info(`Initiating PayMongo session for: ${email}`, { itemsCount: items.length });

  try {
    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: "Gemma's Gulayan Fresh Harvest Order",
            line_items: items.map((item: any) => ({
              currency: "PHP",
              amount: Math.round(item.pricePerUnit * 100), // convert to centavos
              description: item.name,
              name: item.name,
              quantity: item.quantity,
            })),
            payment_method_types: ["gcash", "paymaya", "card"],
            billing: {
              name: `${firstName || 'Guest'} ${lastName || ''}`.trim(),
              email: email,
              phone: phoneNumber,
            },
            success_url: "https://studio.firebase.google.com/profile/orders?payment=success",
            cancel_url: "https://studio.firebase.google.com/checkout",
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("PayMongo API Error Response:", errorText);
      let errorDetail = "Failed to create checkout session";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.errors?.[0]?.detail || errorDetail;
      } catch (e) {
        // use default
      }
      throw new HttpsError("internal", `PayMongo Error: ${errorDetail}`);
    }

    const session = await response.json();
    return {
      checkoutUrl: session.data.attributes.checkout_url,
      sessionId: session.data.id,
    };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    
    logger.error("Unexpected Error during PayMongo call:", error);
    throw new HttpsError("internal", error.message || "An unexpected error occurred during payment initiation");
  }
});
