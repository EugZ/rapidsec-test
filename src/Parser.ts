import { RSS_FEED } from "./constants";

class Parser {
    private parser;
    private feed: Array<RSS_FEED> = [];

    constructor(parser) {
        this.parser = parser;
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
        const feed = await this.parser.parseURL(
            "https://hnrss.org/newest?points=10",
        );

        feed.items.forEach((item, index) => {
            this.feed[index] = this.formatRSSItem(item);
        });

        // TEST
        this.feed.forEach(feedItem => {
            console.log("FEED ITEM ===========");
            console.log(feedItem);
        });
        // TEST
    }

    public startParse = () => {
        this.getRssFeed();
    };
}

export default Parser;
