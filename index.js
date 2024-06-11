#!/usr/bin/env node
const commandLineArgs = require("command-line-args");
const sanitize = require("sanitize-filename");
const fs = require("fs-extra");

const optionDefinitions = [
  { name: "verbose", alias: "v", type: Boolean, defaultValue: false },
  {
    name: "input",
    alias: "i",
    type: String,
    multiple: false,
    defaultValue: "tiddlers.json",
  },
  {
    name: "output",
    alias: "o",
    type: String,
    multiple: false,
    defaultValue: "output",
  },
];
const config = commandLineArgs(optionDefinitions);

let successCount = 0;
let writingErrorCount = 0;

convertTiddlerJSONToMDFiles();

async function convertTiddlerJSONToMDFiles() {
  console.log(`Processing tiddlers from: ${config.input}...`);
  try {
    await fs.ensureDir(`${__dirname}\\${config.output}\\`);
    if (config.verbose) {
      console.log(`Output folder created at ${config.output}.`);
    }
    const tiddlers = await fs.readJSON(config.input);
    const contentOperations = tiddlers.map(prepareFileContent);
    const filesReadyToWrite = await Promise.all(contentOperations);
    if (config.verbose) {
      console.log("Finished preparing tiddlers.");
    }
    const writingOperations = [];
    filesReadyToWrite.forEach((file) => {
      writingOperations.push(writeMDFile(file.title, file.content, config));
    });
    await Promise.all(writingOperations);
    console.log(
      `Converted ${successCount} tiddlers to Markdown files.\nThere were ${writingErrorCount} writing errors to report.\nCheck your \'${config.output}\' folder.`
    );
  } catch (error) {
    throw new Error("The script found a critical error and had to stop.");
  }
}

async function prepareFileContent(tiddler) {
  if (config.verbose) {
    console.log("Preparing tiddler: " + tiddler.title + "...");
  }
  let body = "";
  let yamlFrontmatter = "---\n";
  for (const key in tiddler) {
    if (Object.hasOwnProperty.call(tiddler, key)) {
      const element = tiddler[key];
      if (key == "text") {
        body += "\n" + tiddler[key] + "\n";
      } else if (key == "tags") {
        let all = parseStringArray(tiddler[key], false);
        let underscored = all.join(",").replace(/ /g, "_").toLowerCase();
        yamlFrontmatter += "tags : [ " + underscored + " ]\n";
      } else {
        yamlFrontmatter += key + ": \'" + element + "\'\n";
      }
    }
  }
  // Add an 'aliases' field to front matter that copies the title to make it compatible with Obsidian
  if (tiddler.title !== sanitize(tiddler.title))
  {
    yamlFrontmatter += `aliases: [ \'${tiddler.title}\' ]\n`
  } 
  yamlFrontmatter += "---\n";
  let content = yamlFrontmatter + body;
  return {
    title: tiddler.title,
    content: content,
  };
}

async function writeMDFile(title, content) {
  let filename = sanitize(title);
  try {
    if (config.verbose) {
      console.log(`Writing MD file: ${filename}...`);
    }
    return fs
      .writeFile(`${__dirname}\\${config.output}\\${filename}.md`, content)
      .then(() => {
        successCount++;
      });
  } catch (error) {
    console.log(`There was an error writing the file for ${filename}.`);
    writingErrorCount++;
  }
}

// Adapted from the TW5 source code: https://github.com/Jermolene/TiddlyWiki5/blob/b6ce353a7d0131a06b9081eae2f7ee5776882ebf/boot/boot.js#L371
function parseStringArray(value, allowDuplicate) {
  if (typeof value === "string") {
    var memberRegExp =
        /(?:^|[^\S\xA0])(?:\[\[(.*?)\]\])(?=[^\S\xA0]|$)|([\S\xA0]+)/gm,
      results = [],
      names = {},
      match;
    do {
      match = memberRegExp.exec(value);
      if (match) {
        var item = match[1] || match[2];
        if (
          item !== undefined &&
          (!names.hasOwnProperty(item) || allowDuplicate)
        ) {
          results.push(item);
          names[item] = true;
        }
      }
    } while (match);
    return results;
  } else {
    return null;
  }
}
