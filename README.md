# Look

Look is a perfomance profiler for node.js applications based on [nodetime](https://nodetime.com/).
Look doesn't send any data outside your server.

# Installation

	npm install look

# Usage

The following call should be placed before any other require statement in your application, e.g. at the first line of your main module

```js
require('look').start();
```

Look will be started as a web server on port `5959`, you can access it by pointing your browser to: `http://[yourhost]:5959`

# Options

  - `port` Listening port, defaulting to `5959`
  - `host` Listening host, defaulting to `0.0.0.0`
  - `user` string of "username:password", if present enable http basic authentication, defaulting null
  - `real` string for realm in basic auth, defaulting `mydomain`

```js
require('look').start(3000, '127.0.0.1', 'username:password', 'example.org');
```
