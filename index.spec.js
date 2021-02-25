let os = require('os');
let path = require('path');
let exec = require('child_process').exec;

test('Code should be 0', async () => {
    jest.setTimeout(30000);

    console.log("output path set to " + os.tmpdir() + '/template.drawio')
    let result = await cli(['draw.io', '--template-file', './tests/template.json', '--output-file', os.tmpdir() + '/template.drawio', '--ci-mode' ], '.');
    console.log(result.stdout)
    console.log(result.stderr)
    expect(result.code).toBe(0);

    console.log("output path set to " + os.tmpdir())
    result = await cli(['html', '--template-file', './tests/template.json', '--output-path', os.tmpdir(), '--ci-mode'], '.');
    console.log(result.stdout)
    console.log(result.stderr)
    expect(result.code).toBe(0);

})


function cli(args, cwd) {
    return new Promise(resolve => {
        exec(`node ${path.resolve('./index.js')} ${args.join(' ')}`,
            { cwd },
            (error, stdout, stderr) => {
                resolve({
                    code: error && error.code ? error.code : 0,
                    error,
                    stdout,
                    stderr
                })
            })
    })
}