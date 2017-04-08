#!/usr/bin/env node
const program  = require( 'commander' );
const shell    = require( 'shelljs' );
const commands = require( './commands' );

if ( ! shell.which( 'git' ) ) {
    shell.echo( 'This script requires access to a local git.' )
    shell.exit(1);
}

/**
 * Define command-line flags and subcommands available.
 *
 */
program
	.version( '0.0.1' )
    .option( '-C, --chdir <path>', 'change the working directory' );

program
    .command( 'repo' )
    .description( 'Get information about the current repository on Beanstalk' )
    .action( commands.repo );

program
	.command( 'code-review <branch>' )
    .alias( 'cr' )
    .description( 'Get all open code-reviews in the current repository.' )
    .action( commands.codeReview );

program.parse( process.argv );

