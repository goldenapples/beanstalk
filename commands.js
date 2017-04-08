const shell      = require( 'shelljs' );
const _          = require( 'lodash' );
var GitUtils     = require( './includes/GitUtils' );
var BeanstalkAPI = require( './includes/BeanstalkAPI' );


/**
 * @command `bs repo`
 *
 */
const repo = async ( options ) => {

    try {
        let repositoryID = await GitUtils.getCurrentRepositoryID();
        let req = await BeanstalkAPI.get( '10up', `repositories/${repositoryID}`, {} );
        let repo = req.repository;

        shell.echo( `
Repository Details:

Title: ${repo.title}
HTTPS URL: ${repo.repository_url_https}
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
const codeReview = async ( branch, options ) => {
    try {
        let repositoryID = await GitUtils.getCurrentRepositoryID();
        let req = await BeanstalkAPI.get( '10up',`${repositoryID}/code_reviews`, {} )

        branch = branch || GitUtils.currentBranch();

        let CR = _.find( req.code_reviews, ( cr ) => { return ( cr.target_branch === branch ); } )
        console.log( CR );
    } catch (err) {
        shell.echo( `Error finding a code review associated with branch ${branch} is this repository.` );
        shell.exit();
    }
};

module.exports = { repo, codeReview };
