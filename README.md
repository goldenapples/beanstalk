Beanstalk CLI client
====================

This script is a basic attempt at making some of the features I've gotten used
to using with Github repos using [hub](https://github.com/github/hub) available
for repositories maintained in [Beanstalk](http://beanstalkapp.com/).

So far there's not a lot of functionality here, but if you'd like to follow
along and try it out, here are some basic steps to getting it working:

First, this requires the latest version on node.js (v7.8.0 or higher). Sorry -
but I was building this as much for a chance to experiment with the async/await
functionality as for the end result, so not sorry, really.

First, you'll have to set up a user token for API access in your Beanstalk
account. Click your user name, then go the "Access Tokens" tab, generate a new
token. Copy that to your clipboard, because you'll need to set it as an
environment variable.

Next, add the following lines to a shell config file (`.bashrc`, `zshrc`,
etc.):

    export BEANSTALK_ACCESS_TOKEN='your access token from above' 
    export BEANSTALK_USERNAME='your beanstalk user name'

Clone this repo, and make sure to set executable permissions on the index.js
file:

    chmod +x index.js

I'm just using this by aliasing it in my `.bash_aliases` like this:

    alias stalk="~/beanstalk/index.js"

(Real installation will come after the script is functional enough to be
usable...)

Contributions welcome. Just open an issue or pull-request with any ideas you
may have...
