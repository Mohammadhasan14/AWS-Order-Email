import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { shop, topic, payload, admin } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("payload==: ", payload);

    if (shop && payload) {
      
      

      return { success: true };
    } else {
      return { error: "Invalid order data" }, { status: 400 };
    }

  } catch (error) {
    console.error("Error processing webhook:", error);
    return { error: "Internal server error" }, { status: 500 };
  }
};
