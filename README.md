# cfn-diagram
![Node.js CI](https://github.com/mhlabs/cfn-diagram/workflows/Node.js%20CI/badge.svg)

CLI tool to visualise CloudFormation/SAM/CDK templates as diagrams. 

## Installation
`npm i -g @mhlabs/cfn-diagram`

## Usage
```
Usage: cfn-dia [options] [command]

Options:
  -v, --vers                          Output the current version
  -h, --help                          Display help for command

Commands:
  draw.io|d [options]                 Generates a draw.io diagram from a CloudFormation template
  html|h [options]                    Generates a vis.js diagram from a CloudFormation template
  browse|b [options]                  Browses and generates diagrams from your deployed templates
  help [command]                      Display help for command

Draw.io Options:
  -t, --template-file [templateFile]  Path to template or cdk.json file
  -c, --ci-mode                       Disable terminal/console interactivity
  -o, --output-file [outputFile]      Name of output file
  -co, --cdk-output [outputPath]      CDK synth output path
  -s, --skip-synth                    Skips CDK synth
  -e, --exclude-types [excludeTypes]  List of resource types to exclude when using CI mode

Html Options:
  -t, --template-file [templateFile]  Path to template or cdk.json file
  -c, --ci-mode                       Disable terminal/console interactivity
  -o, --output-path [outputPath]      Name of output file
  -co, --cdk-output [outputPath]      CDK synth output path
  -s, --skip-synth                    Skips CDK synth
```

## Output formats

### Draw.io
Use it in combination with the [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) for VS Code to instantly visualise your stacks.

![Demo](https://raw.githubusercontent.com/mhlabs/cfn-diagram/master/demo.gif)

#### Example 
```
cfn-dia draw.io -t template.yaml
```

#### Features 
* Select only the resource types you want to see. This lets you skip granlar things like roles and policies that might not add to the overview you want to see
* Navigate through a new differnet layouts
* Works for both JSON and YAML templates
* Filter on resource type and/or resource names
* Works with CloudFormation, SAM and CDK

### HTML
The HTML output uses [vis.js](https://github.com/visjs/vis-network) to generate an interactive diagram from your template.

![Demo](https://raw.githubusercontent.com/mhlabs/cfn-diagram/master/demo-html.gif)

#### Example 
```
cfn-dia html -t template.yaml
```
or, for CDK stacks, go to project directory (where cdk.json is located) and enter
```
cfn-dia html 
```

### CI-mode
This functionality lives in its own CLI, [cfn-diagram-ci](https://raw.githubusercontent.com/mhlabs/cfn-diagram-ci). This is beacuse it requires headless Chromium to be installed which makes the package size very large

It uses [pageres](https://github.com/sindresorhus/pageres) to generate a screenshot of a HTML diagram. This can be used in a CI/CD pipeline to keep an always up-to-date diagram in your readme-file.

#### Example 
```
cfn-dia image -t template.yaml
```


## Known issues
* Some icons are missing. Working on completing the coverage.
* When using WSL you might experience `Error: spawn wslvar ENOENT` when trying to use HTML output. To resolve, install [wslu](https://github.com/wslutilities/wslu). See issue #9.