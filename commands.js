const program    = require( 'commander' );
const shell      = require( 'shelljs' );
const Table      = require( 'table-layout' );
const _          = require( 'lodash' );
var GitUtils     = require( './includes/GitUtils' );
var ShellUtils   = require( './includes/ShellUtils' );
var BeanstalkAPI = require( './includes/BeanstalkAPI' );


/**
 * @command `bs repo`
 *
 */
const repo = async ( options ) => {

    try {
        let organization = await GitUtils.organization;
        let repositoryID = await GitUtils.getCurrentRepositoryID();
        let req = await BeanstalkAPI.get( organization, `repositories/${repositoryID}`, {} );
        let repo = req.repository;

        shell.echo( `
Repository Details:

Title: ${repo.title} [Beanstalk ID: ${repo.id}]

HTTPS URL: https://${organization}.beanstalkapp.com/${repo.name}/
${repo.vcs} address: ${repo.repository_url}
` 
        ); 

    } catch (err) {
        shell.echo( 'Error getting the repository ID for this project. If you have it, try setting it with `git config beanstalk.repository`.' );
        shell.exit();
    }
};

/**
 * @command `bs code-review`
 *
 */
const codeReview = async ( env, options ) => {
    let target_branch = options.target || GitUtils.branch;
    let source_branch = options.base || 'master';
    let merge = options.merge || false;
    let message = options.message || await ShellUtils.getTextFromEditor();
    if ( message.length === 0 ) {
        shell.echo( 'A description is required to open a new code review request.' ); 
        shell.exit();
    }
    let [ description, comment ] = message.split( /[\r\n][\r\n\s]*/, 1 );

    console.log( ' target: %j', target_branch );
    console.log( ' base: %j', base_branch );
    console.log( ' description: %j', description );
    console.log( ' comment: %j', comment );
    console.log( ' merge; %j', merge );

    let req = await BeanstalkAPI.post( `${repositoryID}/code_reviews`, { target_branch, source_branch, description, merge } );

    shell.echo( `https://${organization}.beanstalkapp.com/${repo_name}/code_reviews/${req.id}` );

    // TODO: If the "message" included a commentC, post it now as a comment.

    shell.exit();
};

/**
 * @command `bs code-reviews`
 */
const codeReviews = async ( options ) => {
    let organization = GitUtils.organization;
    let repositoryID = await GitUtils.getCurrentRepositoryID();
    let repo_name = await GitUtils.getCurrentRepositoryName();
    let state = options.status || 'pending';
    let per_page = options.per_page || 100;
    let page = ( options.per_page && options.page ) ? options.page : 1;

    let req = await BeanstalkAPI.get( organization, `${repositoryID}/code_reviews`, { state } );
    let reviews = req.code_reviews;

    if ( options.branch ) {
        // Parse refs like "HEAD" or "-" where possible
        let branch = shell.exec( `git rev-parse --abbrev-ref ${options.branch}` ).stdout.trim() || options.branch;
        reviews = _.find( reviews, ( cr ) => { return ( cr.target_branch === branch ); } )

        if ( ! reviews.length ) {
            shell.echo ( `No open reviews were found for branch ${branch}.` );
            shell.exit();
        }
    }

    reviews.sort( (a,b) => { return a.updated_date > b.updated_date; } );
    reviews = _.map( reviews, (rev) => { 
        return {
            reviewDetails: rev.description + 
                `\n[${rev.state.toUpperCase()}] ${rev.target_branch}..${rev.source_branch}` +
                `\nhttps://${organization}.beanstalkapp.com/${repo_name}/code_reviews/${rev.id}/` +
                `\n`,
            statusDetails: `Updated: ${rev.updated_at}` +
                `\nComments: ${rev.comments_count}`
        };
    } );

    reviews.unshift( { reviewDetails: 'CODE REVIEW' + "\n", statusDetails: "ACTIVITY" } );
    const table = new Table( reviews );
    shell.echo( table.toString() );

};

module.exports = { repo, codeReview, codeReviews };
