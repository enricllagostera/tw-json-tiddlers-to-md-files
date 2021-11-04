# tw-json-tiddlers-to-md-files

A tool to convert tiddlers in a JSON source to multiple Markdown files, one per tiddler.

## Usage

**Warning 1:** this tool overwrites the contents of the output folder in case of name conflicts with new note files being generated. Be careful.

**Warning 2:** the output folder will be created in case it does not exist already.

### Steps

1. Generate the JSON file with your wiki's content via the `Export all > JSON` option on TiddlyWiki's `More actions` menu.
2. Run the tool.
3. Open your output folder to access your MD files.

### Parameters

`--input` or `-i`: A string with the source JSON file name. Default: `tiddlers.json`.

`--output` or `-o`: A string with the output folder name. Default: `output`.

`--verbose` or `-v`: A true/false value to enable verbose logging. Default: `false` / omitted.

#### Examples

N/A.
