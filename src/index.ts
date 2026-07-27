import Parser from "rss-parser";
import { parseConfig } from "./schema";
import * as fs from 'node:fs/promises';

const config = parseConfig();

if (!config) {
  console.error("failed to load config");
  process.exit(1);
}

async function processTemplate(text: string) {
  const pattern = /(<!-- START-(.*?) -->)([\s\S]*?)(<!-- END-.*? -->)/g;
  const parser = new Parser();

  const matches = [...text.matchAll(pattern)];
  let result = text;

  for (const match of matches) {
    if (config) {
      const fullMatch = match[0];
      const startTag = match[1];
      const sectionName = match[2];
      const endTag = match[4];

      const section = config[sectionName];

      const feed = await parser.parseURL(section.url);

      const links: string[] = [];
      feed.items.slice(0, section.limit).forEach((item) => {
        links.push(`- [${item.title}](${item.link})`);
      });

      const newContent = links.join("\n");

      const replacement = `${startTag}\n${newContent}\n${endTag}`;
      result = result.replace(fullMatch, replacement);
    }
  }

  return result;
}

(async () => {
  const readme = await fs.readFile('README.md');

  const res = await processTemplate(readme.toString());

  await fs.writeFile('README.md', res);
})();
