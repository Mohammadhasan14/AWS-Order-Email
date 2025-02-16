import { getObjectURL } from "../aws/getObjectURL";
import sendEmail from "../emailService/sendEmail";
import generateOrderEmailHTML from "../emailTemplates/generateOrderEmailHTML";
import { OrderStatus } from "../model/orders";
import { sessionModel } from "../model/session-model";


// function generating email links and sending email
const processOrder = async (data, customerEmail) => {
    let orderLinks = {};

    // generating download links for the items
    if (data?.lineItems?.nodes) {
        await Promise.all(
            data.lineItems.nodes.map(async (item) => {
                try {
                    const link = await getObjectURL(`Movies/${item.variant.id}.mp4`);
                    orderLinks[item.name] = link;
                } catch (error) {
                    console.log(`Error processing line item ${item.name}:`, error);
                }
            })
        );
    } else {
        console.log("line items not found for order:", data.id);
    }

    console.log("generated orderLinks:", orderLinks);
    const htmlTemplateToSend = await generateOrderEmailHTML(orderLinks);
    const sendEmailResponse = await sendEmail({
        to: customerEmail,
        subject: "Your order download links",
        html: htmlTemplateToSend,
    });

    if (sendEmailResponse.success) {
        console.log(`Email sent successfully for order ID: ${data.id}`);
        await OrderStatus.findOneAndUpdate({ orderId: data.id }, { isEmailSent: true });
    } else {
        console.log(`Failed to send email for order ID: ${data.id}`);
        throw new Error("Email sending failed");
    }
};

export default async function checkOrderEmailStatus() {
    try {
        const session = await sessionModel.findOne();
        console.log("Session:", session);

        // as per indian time start and end date
        const now = new Date();
        const endTime = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString();
        now.setMinutes(now.getMinutes() - 20);
        const startTime = new Date(now.getTime() + (5 * 60 + 30) * 60000).toISOString();
        console.log("startTime", startTime);
        console.log("endTime", endTime);
        


        const responseOrders = await fetch(
            `https://${session.shop}/admin/api/2024-10/graphql.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": session.accessToken,
                },
                body: JSON.stringify({
                    query: `
                    {
                        orders(
                            first: 200
                            query: "created_at:>=${startTime} AND created_at:<=${endTime}"
                        ) {
                            nodes {
                                id
                                email
                                customer{
                                    email
                                }
                                lineItems(first: 250) {
                                    nodes {
                                        id
                                        name
                                        variant {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                    `
                })
            }
        );

        const responseOrdersData = await responseOrders.json();
        console.log("Response Orders Data:", responseOrdersData);

        // if orders data is present
        if (responseOrdersData?.data?.orders?.nodes?.length) {
            const orderNodes = responseOrdersData.data.orders.nodes;

            // processing ordsers
            for (let data of orderNodes) {
                console.log("data------------------->", data);

                let customerEmail
                if (data?.email) {
                    customerEmail = data?.email
                } else if (data?.customer?.email) {
                    customerEmail = data?.customer?.email
                }
                const foundData = await OrderStatus.findOne({ orderId: data.id });
                if (foundData) {
                    if (!foundData.isEmailSent) {
                        await processOrder(data, customerEmail);
                    } else {
                        console.log(`Email already sent for order ID: ${data.id}`);
                    }
                } else {
                    const newData = new OrderStatus({
                        orderId: data.id,
                        isEmailSent: false,
                    });
                    try {
                        await newData.save();
                        await processOrder(data, customerEmail);
                    } catch (error) {
                        console.log(`Error saving OrderStatus for order ID: ${data.id}:`, error);
                    }
                }
            }
        } else {
            console.log("no orders found in the response.");
        }
        return { success: true };
    } catch (error) {
        console.log("error in checkOrderEmailStatus:", error);
        return { success: false };
    }
}
