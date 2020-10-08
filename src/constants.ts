export const CRON_DELAY: string = "*/10 * * * * *"; // every 10 seconds

export type RSS_FEED = {
    title: string;
    timestamp: Date;
    link: string;
    creator: string;
    points: number;
    comments: number;
};

export type RSS_LOGS = {
    url: string;
    request_time: number;
    amount_returned: number;
    status: "success" | "failure";
};
