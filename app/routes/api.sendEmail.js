import { getObjectURL } from "../aws/getObjectURL";
import generateOrderEmailHTML from "../emailTemplates/generateOrderEmailHTML";
import sendEmail from "../emailService/sendEmail";

export async function action({ request }) {
    try {
        const { orders } = await request.json();
        if (!orders || orders.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "No orders provided" }),
                { status: 400 }
            );
        }

        await Promise.all(
            orders.map(async (order) => {
                const customerEmail = order.email || (order.customer && order.customer.email);
                if (!customerEmail) {
                    console.error(`cdsustomer email not found for order ${order.id}`);
                    return;
                }
                if (!order.lineItems || !order.lineItems.nodes) {
                    console.error(`line items not found for order ${order.id}`);
                    return;
                }

                const orderLinks = {};
                await Promise.all(
                    order.lineItems.nodes.map(async (item) => {
                        // console.log("item", item);

                        try {
                            const link = await getObjectURL(`Movies/${item.variant.id}.mp4`);
                            orderLinks[item.name] = link;
                        } catch (error) {
                            console.error(`error while processing line item ${item.name} for order ${order.id}:`, error);
                        }
                    })
                );

                console.log(`generated orderLinks for order ${order.id}:`, orderLinks);

                const htmlTemplateToSend = await generateOrderEmailHTML(orderLinks);
                await sendEmail({
                    to: customerEmail,
                    subject: "Your order download links",
                    html: htmlTemplateToSend,
                });
            })
        );

        return new Response(
            JSON.stringify({ success: true, message: "Emails sent" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("error in sendEmail action:", error);
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 500 }
        );
    }
}
