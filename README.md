# cfn-diagram
![Node.js CI](https://github.com/mhlabs/cfn-diagram/workflows/Node.js%20CI/badge.svg)

CLI tool to visualise CloudFormation templates as draw.io diagrams. Use it in combination with the [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) for VS Code to instantly visualise your stacks.

![Demo](https://raw.githubusercontent.com/mhlabs/cfn-diagram/master/demo.gif)

## Installation
`npm i -g @mhlabs/cfn-diagram`

## Usage
cfn-dia
```
Usage: cfn-dia [options] [command]

Options:
  -v, --vers            output the current version
  -h, --help            display help for command

Commands:
  generate|g [options]  Generates a draw.io diagram from a CloudFormation template
  help [command]        display help for command
```

## Example 
```
cfn-dia generate -t template.yaml
```

## Features 
* Select only the resource types you want to see. This lets you skip granlar things like roles and policies that might not add to the overview you want to see
* Navigate through a new differnet layouts
* Works for both JSON and YAML templates
* Filter on resource type and/or resource names

## Known issues
* Some icons are missing. Working on completing the coverage.
