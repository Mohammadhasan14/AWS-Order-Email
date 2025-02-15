import sendEmail from "../emailService/sendEmail";
import { authenticate } from "../shopify.server";
import { OrderStatus } from "../model/orders";
import { getObjectURL } from "../aws/getObjectURL";
import generateOrderEmailHTML from "../emailTemplates/generateOrderEmailHTML";

const processOrderPaid = async (payload) => {
  const newData = new OrderStatus({
    orderId: payload.admin_graphql_api_id,
    isEmailSent: false
  });

  try {
    await newData.save();
  } catch (error) {
    console.log("error saving OrderStatus:", error);
  }

  let orderLinks = {};

  for (let data of payload.line_items) {
    try {
      const link = await getObjectURL(`Movies/${data.variant_id}.mp4`);
      orderLinks[data.name] = link;
    } catch (error) {
      console.log("error processing line item in order_paid webhook:", error);
    }
  }
  console.log("orderLinks:", orderLinks);

  const htmlTemplateToSend = generateOrderEmailHTML(orderLinks);

  let customerEmail;
  if (payload.email) {
    customerEmail = payload.email
  } else if (payload.customer.email) {
    customerEmail = payload.customer.email
  } else if (payload.contact_email) {
    customerEmail = payload.contact_email
  }

  const sendEmailResponse = await sendEmail({
    to: customerEmail,
    subject: "Your order download links",
    html: htmlTemplateToSend
  });

  if (sendEmailResponse.success) {
    console.log("Email sent successfully through webhook.");
    await OrderStatus.findOneAndUpdate({ orderId: payload.admin_graphql_api_id }, { isEmailSent: true });
  } else {
    console.log("Email sending failed.");
    return { error: "Failed to send email" }, { status: 500 };
  }
}

export const action = async ({ request }) => {
  try {
    const { shop, topic, payload, admin } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("payload==: ", payload);

    processOrderPaid(payload)
    console.log("log after calling a processOrderPaid function");
    
    return { success: true };

  } catch (error) {
    console.error("Error processing webhook:", error);
    return { error: "Internal server error" }, { status: 500 };
  }
};
