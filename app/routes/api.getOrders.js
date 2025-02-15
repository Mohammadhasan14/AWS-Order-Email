import { OrderStatus } from "../model/orders";
import { authenticate } from "../shopify.server";

const fetchOrdersApiData = async (admin, orderIDs) => {
    const response = await admin.graphql(
        `query MyQuery {
        nodes(ids: ${JSON.stringify(orderIDs)}) {
          ... on Order {
            id
            name
            note
            email
            customer {
                email
            }
            shippingAddress {
              address1
              address2
              city
              country
              countryCodeV2
              firstName
              lastName
              formattedArea
              name
              phone
              province
              provinceCode
              zip
              countryCode
            }
            customAttributes {
              key
              value
            }
            lineItems(first: 250) {
              nodes {
                sku
                currentQuantity
                variant {
                  product {
                    id
                    title 
                    tags
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }`,
    );

    const data = await response.json();
    // console.log("data?.data?.nodes", data?.data?.nodes);
    return data?.data?.nodes
}

export async function action({ request }) {
    const { admin } = await authenticate.admin(request);
    const data = await request.json()
    console.log("data", data);
    try {

        const dbData = await OrderStatus.find({})

        // console.log("dbData", dbData);
        // adding gid in ids
        const idsArray = dbData.map(d => d.orderId)
        // console.log("idsArray", idsArray);

        // fetching all the ids data
        const gotOrdersApiData = await fetchOrdersApiData(admin, idsArray)

        // adding db data in all the nodes data
        let allOrders = []
        if (gotOrdersApiData?.length) {
            gotOrdersApiData?.map(d => {
                const foundData = dbData.find(data => data.orderId === d.id)
                if (foundData) {
                    allOrders.push({ ...d, dbData: foundData })
                } else {
                    console.log("data not found in adding db data in each nodes data");
                }
            })
            // console.log("allOrders", allOrders);
        } else {
            console.log("data not found in admin api from getOrders api", gotOrdersApiData)
        }

        return { success: true, allOrders };
    } catch (error) {
        console.log("ERROR on api.getOrders", error);
        return { success: false };
    }
}