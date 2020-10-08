import { RSS_FEED, RSS_LOGS } from "./constants";
import { Client } from "@elastic/elasticsearch";
const EventEmmiter = require("events");

class Parser extends EventEmmiter {
    private parser;
    private url: string;
    private feed: Array<RSS_FEED> = [];
    private logs: Array<RSS_LOGS> = [];
    private elasticClient;

    constructor(parser, url: string) {
        super();

        this.parser = parser;
        this.url = url;

        this.elasticClient = new Client({
            node: process.env.ELASTIC_ENDPOINT,
        });

        this.addListener("parseEnd", this.sendDataToElastic);
    }

    private getPoints = (content: string): number => {
        const lines: Array<string> = content.split("\n");
        let points: number = 0;

        lines.forEach(line => {
            if (line.toLowerCase().includes("points")) {
                line = line.replace("<p>", "");
                line = line.replace("</p>", "");
                const lineElements: Array<string> = line.split(": ");
                points = Number(lineElements[1]);
            }
        });

        return points;
    };

    private getCommentsNumber = (content: string): number => {
        const lines: Array<string> = content.split("\n");
        let comments: number = 0;

        lines.forEach(line => {
            if (
                line.toLowerCase().includes("comments") &&
                !line.toLowerCase().includes("url")
            ) {
                line = line.replace("<p>", "");
                line = line.replace("</p>", "");
                const lineElements: Array<string> = line.split(": ");
                comments = Number(lineElements[1]);
            }
        });

        return comments;
    };

    private formatRSSItem = (item: object): RSS_FEED => {
        const formatted: RSS_FEED = {
            title: "",
            timestamp: new Date(),
            link: "",
            creator: "",
            points: 0,
            comments: 0,
        };

        formatted.title = item["title"] || "";
        formatted.timestamp = item["pubDate"] || new Date();
        formatted.link = item["link"] || "";
        formatted.creator = item["creator"] || "";
        formatted.points = this.getPoints(item["content"]);
        formatted.comments = this.getCommentsNumber(item["content"]);

        return formatted;
    };

    private async getRssFeed() {
        const feed = await this.parser.parseURL(this.url);

        feed.items.forEach((item, index) => {
            this.feed[index] = this.formatRSSItem(item);
        });
    }

    private log({ url, request_time, amount_returned, status }): void {
        this.logs.push({
            url,
            request_time,
            amount_returned,
            status: status ? "success" : "failure",
        });
    }

    private sendDataToElastic() {
        this.feed.forEach(feedItem => {
            console.log("THIS", this);
            const {
                title,
                timestamp,
                link,
                creator,
                points,
                comments,
            } = feedItem;

            this.elasticClient.index({
                index: "rss",
                body: {
                    title,
                    timestamp,
                    link,
                    creator,
                    points,
                    comments,
                },
            });
        });

        this.logs.forEach(logItem => {
            const { url, request_time, amount_returned, status } = logItem;

            this.elasticClient.index({
                index: "log",
                body: {
                    url,
                    request_time,
                    amount_returned,
                    status,
                },
            });
        });
    }

    public startParse = async () => {
        let isSuccess: boolean = true;
        let totalTime: number = 0;

        try {
            const startTime = Date.now();
            await this.getRssFeed();
            const endTime = Date.now();
            totalTime = endTime - startTime;
        } catch (e) {
            isSuccess = false;
        } finally {
            this.log({
                url: this.url,
                request_time: totalTime,
                amount_returned: this.feed.length,
                status: isSuccess,
            });

            this.emit("parseEnd");
        }
    };
}

export default Parser;
