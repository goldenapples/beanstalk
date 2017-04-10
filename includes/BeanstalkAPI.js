const request  = require( 'request-promise' );
const shell    = require( 'shelljs' );

/**
 * Build the headers for an API request.
 *
 * @private
 *
 * @param String Organization (subdomain of .beanstalkapp.com)
 * @param String Endpoint
 * @param Object Query parameters
 */
const _buildAPIRequest = function( organization, endpoint ) {
    let user = shell.env["BEANSTALK_USERNAME"];
    let pass = shell.env["BEANSTALK_ACCESS_TOKEN"];
    return {
        uri: `https://${organization}.beanstalkapp.com/api/${endpoint}.json`,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Beanstalk CLI client <than@10up.com>'
        },
        auth: { user, pass },
        json: true
    };
};

/**
 * Make a GET request to the Beanstalk API.
 *
 * @param String Organization (subdomain of .beanstalkapp.com)
 * @param String Endpoint 
 * @param Object Query parameters
 */
const get = async function( organization, endpoint, params ) {
    var _requestParams = _buildAPIRequest( organization, endpoint );
    _requestParams[ 'qs' ] = params;
    return await request.get( _requestParams );
};

/**
 * Make a POST request to the Beanstalk API.
 *
 * @param String Organization (subdomain of .beanstalkapp.com)
 * @param String Endpoint 
 * @param Object Object Post body data, will be JSON encoded
 */
const post = async function( organization, endpoint, data ) {
    var _requestParams = _buildAPIRequest( organization, endpoint );
    _requestParams[ 'body' ] = JSON.stringify( data );
    return await request.post( _requestParams );
};

module.exports = { get, post };

