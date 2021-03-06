import { CronJob } from "cron";
import RssParser from "rss-parser";

import Parser from "./Parser";
import { CRON_DELAY } from "./constants";

const parser = new Parser(
    new RssParser(),
    "https://hnrss.org/newest?points=10",
);

const job = new CronJob(CRON_DELAY, parser.startParse);

export default job;
