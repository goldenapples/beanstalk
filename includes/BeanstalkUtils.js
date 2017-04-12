const GitUtils = require( './GitUtils' );
const shell = require( 'shelljs' );
const BeanstalkAPI = require( './BeanstalkAPI' );

const exitOnError = ( error ) => {
    shell.echo( 'Error: ', error.message );
    shell.exit();
}

/**
 * Get organization, ID, and repository name
 *
 * Without these values, not other operations are possible.
 *
 */
const bootstrapRepo = async () => {
    try {
        let organization = await GitUtils.organization;
        let repositoryID = await GitUtils.getCurrentRepositoryID();
        let repo_name    = await GitUtils.getCurrentRepositoryName();
        return { organization, repositoryID, repo_name };
    } catch ( error ) {
        exitOnError( error );
    }
}

const getRepoDetails = async ( organization, repositoryID ) => {
    try {
        let req = await BeanstalkAPI.get( organization, `repositories/${repositoryID}`, {} );
        let repo = req.repository;
        console.log( req );
        return req.repository;
    } catch ( error ) {
        exitOnError( error );
    }
}

const getReviews = async ( getReviewsRequest ) => {
    try {
        let {
            organization,  repositoryID,  repo_name,
            state,         per_page,      page        } = getReviewsRequest;
        let req = await BeanstalkAPI.get( organization, `${repositoryID}/code_reviews`, { state } );
        return req.code_reviews;
    } catch ( error ) {
        exitOnError( error );
    }
}

const createReview = async ( codeReviewRequest ) => {
    try {
        let {
            organization,  repositoryID,   repo_name,
            target_branch, source_branch, 
            description,   merge                      } = codeReviewRequest;

        let codeReview = await BeanstalkAPI.post( organization, `${repositoryID}/code_reviews`, 
            { code_review: { target_branch, source_branch, description, merge } } 
        );

        return codeReview.id;
    } catch ( error ) {
        exitOnError( error );
    }
}

const postComment = async ( postCommentRequest ) => {
    try {
        let {
            organization,  repositoryID,   repo_name,
            reviewID,      body
        } = postCommentRequest

        let postedComment = await BeanstalkAPI.post( organization, `${repositoryID}/code_reviews/${review_ID}/comments`,
            { comment: { body } }
        );

        return postedComment.id;
    } catch ( error ) {
        exitOnError( error );
    }
}

module.exports = { bootstrapRepo, getRepoDetails, getReviews, createReview, postComment };

