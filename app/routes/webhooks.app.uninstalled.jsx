import { authenticate } from "../shopify.server";
import { sessionModel } from "../model/session-model";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await sessionModel.deleteMany({ shop });
  }

  return new Response();
};
