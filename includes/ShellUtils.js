const fs = require( 'fs' );
const shell = require( 'shelljs' );
const child_process = require( 'child_process' );
const async_child_process = require( 'async-child-process' );

async function openEditor( file ) {
}

async function getTextFromEditor() {
    let tempFileName = shell.exec( 'mktemp' ).stdout.trim();
    let editor = await async_child_process.join(
        child_process.spawn(
            process.env.EDITOR, [ tempFileName, '-c :f "Description for code review"' ], {
                stdio: [
                    process.stdin,
                    process.stdout,
                    process.stderr
                ]
            }
        )
    );
    let text = fs.readFileSync( tempFileName, 'utf8' );
    return text;
}

module.exports = { getTextFromEditor };
