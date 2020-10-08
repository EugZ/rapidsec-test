export const CRON_DELAY: string = "*/5 * * * * *";

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
    status: "sucees" | "failure";
};
