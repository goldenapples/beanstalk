const shell      = require( 'shelljs' );
const Table      = require( 'table-layout' );
const _          = require( 'lodash' );
var GitUtils     = require( './includes/GitUtils' );
var ShellUtils   = require( './includes/ShellUtils' );
var BeanstalkAPI = require( './includes/BeanstalkAPI' );
var BeanstalkUtils = require( './includes/BeanstalkUtils' );


/**
 * @command `bs repo`
 *
 */
const repo = async ( options ) => {

    let { organization, repositoryID, repo_name } = await BeanstalkUtils.bootstrapRepo();
    let repo = await BeanstalkUtils.getRepoDetails( organization, repositoryID );

    shell.echo( `
Repository Details:

Title: ${repo.title} [Beanstalk ID: ${repo.id}]

HTTPS URL: https://${organization}.beanstalkapp.com/${repo.name}/
${repo.vcs} address: ${repo.repository_url}
` 
    ); 
};

/**
 * @command `bs code-review`
 *
 */
const codeReview = async ( options ) => {

    let { organization, repositoryID, repo_name } = await BeanstalkUtils.bootstrapRepo();
    let target_branch = options.target || GitUtils.branch;
    let source_branch = options.base || 'master';
    let merge = options.merge || false;
    let message = options.message || await ShellUtils.getTextFromEditor();
    if ( message.length === 0 ) {
        shell.echo( 'A description is required to open a new code review request.' ); 
        shell.exit();
    }
    let [ description, comment ] = message.split( /[\r\n][\r\n\s]*/, 1 );

    let codeReviewRequest = {
        organization,
        repositoryID,
        repo_name,
        target_branch,
        source_branch,
        merge,
        message
    };

    let newReviewID = await BeanstalkUtils.createReview( codeReviewRequest );

    shell.echo( `https://${organization}.beanstalkapp.com/${repo_name}/code_reviews/${newReviewID}` );

    // TODO: If the "message" included a commentC, post it now as a comment.

    shell.exit();
};

/**
 * @command `bs cancel <codeReviewID>`
 */
const cancel = async ( ID ) => {
    let { organization, repositoryID, repo_name } = await BeanstalkUtils.bootstrapRepo();


}


/**
 * @command `bs code-reviews`
 */
const codeReviews = async ( options ) => {

    let { organization, repositoryID, repo_name } = await BeanstalkUtils.bootstrapRepo();

    let state = options.status || 'pending';
    let per_page = options.per_page || 100;
    let page = ( options.per_page && options.page ) ? options.page : 1;

    let getReviewsRequest = {
        organization, repositoryID, repo_name,
        state, per_page, page
    };

    let reviews = await BeanstalkUtils.getReviews( getReviewsRequest ); 

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
