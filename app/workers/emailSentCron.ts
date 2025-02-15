import { CronJob } from 'cron';

const jobFirst = CronJob.from({
    cronTime: '* * * * *',
    onTick: async function () {
        try {
            const response = await fetch('https://ar-treatment-prisoners-horn.trycloudflare.com/api/cron/ordersEmailCheck');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('request successful', response.status);
        } catch (error) {
            console.error('error in fetch:', error);
        }
    },
    start: true,
    timeZone: 'America/Los_Angeles'
});
