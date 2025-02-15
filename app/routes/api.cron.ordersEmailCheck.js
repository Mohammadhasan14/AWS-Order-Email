import checkOrderEmailStatus from "../services/checkOrderEmailStatus";

export async function loader({ request }) {
    try {

        const checkOrderEmailStatusData = await checkOrderEmailStatus()
        return { success: true };
    } catch (error) {
        console.log("ERROR on cron.storeStats.execute", error);
        return { success: false };
    }
}