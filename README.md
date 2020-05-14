# cfn-diagram

CLI tool to visualise a CloudFormation template as a draw.io diagram. Use it in combination with the [https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio](Draw.io Integration) for VS Code to instantly visualise your stacks.

![Demo]()

## Installation
`npm i @mhlabs/cfn-diagram`

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

## Known issues
* Some icons are missing. Working on completing the coverage.
* Default layouts get quite messy. In the draw.io menu, use the Arrange -> Layout menu for better options
* Connections between resources are limited to `Ref` and `Fn::GetAtt` intrinsic functions. `Fn::Sub` is coming soon.