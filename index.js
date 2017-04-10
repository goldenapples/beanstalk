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
	.command( 'code-review' )
    .alias( 'cr' )
    .option( '-t, --target <target_branch>', 'Target branch to review' )
    .option( '-b, --base <base_branch>', 'Base branch, to compare against' )
    .option( '-m, --message <text>', 'One-line description for the code review. Any additional text will be entered as a comment on the code review request' )
    .option( '--merge', 'Merge this CR into the base branch when approved?' ) 
    .description( 'Open a new code review request.' )
    .action( commands.codeReview );

program
	.command( 'code-reviews' )
    .alias( 'crs' )
    .option( '-b, --branch <branch>', 'Find open code request matching branch <branch>.' )
    .option( '-s, --status <status>', 'Only show reviews in status <status> ("all" shows all available).' )
    .option( '--per_page <number>', 'Number of reviews to display.' )
    .option( '--page <number>', 'If per_page is set, the page of results to display.' )
    .description( 'Get all open code-reviews in the current repository.' )
    .action( commands.codeReviews );

program.parse( process.argv );

