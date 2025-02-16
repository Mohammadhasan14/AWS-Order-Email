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
              name
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
    }`
  );

  const data = await response.json();
  return data?.data?.nodes || [];
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const data = await request.json();

  const { page = 1, PageSize, queryValue, selectedFilter, emailStatus } = data;
  const limit = Number(PageSize) || 5;
  const skip = (page - 1) * limit;

  //building the match filter if a search query exists, matching orderId via regex.
  const matchStage = {};
  if (queryValue && queryValue.trim() !== "") {
    matchStage.orderId = { $regex: queryValue, $options: "i" };
  }
  // if emailStatus filtering is provided adding it.
  if (Array.isArray(emailStatus) && emailStatus.length > 0) {
    matchStage.isEmailSent = { $in: emailStatus };
  }

  // building sort stage as per on the selected filter
  let sortStage = {};
  if (selectedFilter) {
    const [field, order] = selectedFilter.split(" ");
    if (field === "created") {
      sortStage.createdAt = order === "asc" ? 1 : -1;
    }
  }

  try {
    // counting matching documents for pagination
    const totalCount = await OrderStatus.countDocuments(matchStage);
    const hasNextPage = page * limit < totalCount;
    const hasPreviousPage = page > 1;

    const pipeline = [];
    pipeline.push({ $match: matchStage });
    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    pipeline.push({
      $project: { _id: 1, orderId: 1, isEmailSent: 1, createdAt: 1, updatedAt: 1 }
    });

    const dbData = await OrderStatus.aggregate(pipeline);

    if (dbData.length === 0) {
      return {
        success: false,
        message: "No data found for the requested page.",
        pageInfo: { hasNextPage, hasPreviousPage }
      };
    }

    // collecting order IDs from the paginated mongodb results
    const idsArray = dbData.map((d) => d.orderId);

    // fetcign orders using the Shopify GraphQL API
    const gotOrdersApiData = await fetchOrdersApiData(admin, idsArray);

    // combining mongodb and shopify API data
    const allOrders = gotOrdersApiData
      .map((d) => {
        const foundData = dbData.find((dbItem) => dbItem.orderId === d.id);
        return foundData ? { ...d, dbData: foundData } : null;
      })
      .filter((order) => order !== null);

    return {
      success: true,
      allOrders,
      pageInfo: { hasNextPage, hasPreviousPage }
    };
  } catch (error) {
    console.log("ERROR on api.getOrders", error);
    return { success: false, error: error.message };
  }
}
