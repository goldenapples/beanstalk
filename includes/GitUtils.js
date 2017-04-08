const request      = require( 'request-promise' );
const shell        = require( 'shelljs' );
const _            = require( 'underscore' );
const BeanstalkAPI = require( './BeanstalkAPI' );

/**
 * Commonly-used git utility functions.
 *
 * The results of these are cached internally to avoid having to look them up
 * multiple times. Some, like repository ID, will be cached in the .GIT/config
 * file to avoid having to make additional API requests.
 */
var isValidRepo, organization, repository, branch;

const GitUtils = {


    /**
     * Look up the Beanstalk ID of the current repository.
     *
     * Retrieves a value saved in .GIT/config if available, otherwise makes an
     * API call and tries to identify the correct repo by name.
     *
     * @returns {Promise<string>}
     */
    getCurrentRepositoryID: async () => {
        let repoID = shell.exec( 'git config --get beanstalk.repository' );

        if ( repoID.length ) {
            shell.echo( `Retrieved ID from config; "${repoID}"` );
            return repoID;
        }

        let { origin, organization, repository } = GitUtils.parseCurrentRepositoryOrigin();

        try {
            let repos = await BeanstalkAPI.get( '10up', 'repositories', [] );
            let repo =  _.find( repos, (r) => { return ( r.repository.name === repository ); } );
            repoID = repo.repository.id;

            shell.exec( `git config beanstalk.repository ${repoID}` );
            return repoID;
        } catch (error) {
            console.log( error ); 
            shell.exit();
        }
    },

    /**
     * Parse the repository "origin" url, to determine the organization and repo name.
     *
     * @return {
     *   String|bool      isValidRepo   The full origin URL if it's a valid Beanstalk remote, false if not
     *   String|undefined organization  The organization name if valid, undefined if not
     *   String|undefined repository    The repository name slug if valid, undefined if not
     * }
     */
    parseCurrentRepositoryOrigin: () => {
        if ( 'undefined' === typeof isValidRepo ) {
            let origin = shell.exec( 'git config --get remote.origin.url' );
            [ isValidRepo, organization, repository, ...matches ] = origin.match( /git@\w+.git.beanstalkapp.com:\/([^\/]+)\/([^.]+).git/i );
        }
        if ( ! isValidRepo ) {
            shell.echo( 'Repository is not a Beanstalk repository. Exiting...' ).exit(1);
        }

        shell.exec( `git config beanstalk.organization ${organization}` )
        return { isValidRepo, organization, repository };
    },

    /**
     * Getter for the repo "organization" as used on Beanstalk.
     */
    get organization() {
        let orgFromConfig = shell.exec( 'git config --get beanstalk.organization' );

        if ( orgFromConfig ) {
            return orgFromConfig;
        }

        let { isValid, organization, repository } = this.parseCurrentRepositoryOrigin();
        console.log( organization );
        return organization;
    },

    /**
     * Getter for the current git branch.
     */
    get branch() {
        return shell.exec( 'git rev-parse --abbrev HEAD' );
    },

}

module.exports = GitUtils;
