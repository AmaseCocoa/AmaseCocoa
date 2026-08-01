import Parser from "rss-parser";
import { parseConfig } from "./schema";
import * as fs from "node:fs/promises";
import { renderMarkdown } from "./listenbrainz";

const config = parseConfig();

if (!config) {
  console.error("failed to load config");
  process.exit(1);
}

async function processTemplate(text: string) {
  const pattern = /(<!-- START-(.*?) -->)([\s\S]*?)(<!-- END-.*? -->)/g;
  const parser = new Parser();
  const feeds = [];

  const matches = [...text.matchAll(pattern)];
  let result = text;

  for (const match of matches) {
    if (config) {
      const fullMatch = match[0];
      const startTag = match[1];
      const sectionName = match[2];
      const endTag = match[4];

      let newContent: string = '';
      if (sectionName === "LISTENBRAINZ") {
        newContent = await renderMarkdown('AmaseCocoa')
      } else if (config.feed.enable) {
        const section = config.feed.config[sectionName];

        const feed = await parser.parseURL(section.url);

        const links: string[] = [];
        feed.items.slice(0, section.limit).forEach((item) => {
          links.push(`- [${item.title}](${item.link})`);
          feeds.push({
            title: item.title,
            link: item.link,
          });
        });

        newContent = links.join("\n");
      }

      const replacement = `${startTag}\n${newContent}\n${endTag}`;
        result = result.replace(fullMatch, replacement);
    }
  }

  return {
    readme: result,
    feeds: feeds
  };
}

(async () => {
  const readme = await fs.readFile("README.md");

  const { newReadme, feeds } = await processTemplate(readme.toString());

  await fs.writeFile("feeds.json", JSON.stringify(feeds));
  await fs.writeFile("README.md", newReadme);
})();
