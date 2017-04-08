const request  = require( 'request-promise' );
const shell    = require( 'shelljs' );
const GitUtils = require( './GitUtils' );

/**
 * Build the headers for an API request.
 *
 * @private
 *
 * @param String Organization (subdomain of .beanstalkapp.com)
 * @param String Endpoint
 * @param Object Query parameters
 */
const _buildAPIRequest = function( __, endpoint ) {
    let user = shell.env["BEANSTALK_USERNAME"];
    let pass = shell.env["BEANSTALK_ACCESS_TOKEN"];
    let organization = '10up';
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
    var _requestParams = _buildAPIRequest( organization, endpoint, params );
    return await request.get( _requestParams );
};


module.exports = { get };

