'use strict';

var http = require('http');
var url = require('url');
var request = require('request');

http.createServer(function (req, res) {
    console.log(req.url);

    if (req.url.slice(0, 18) == '/rest/oauth/token?') {
        // Get access token

        // Extract endpoint
        if (!req.headers.endpoint) {
            res.end('No endpoint url specified');
            return;
        }
        var endpoint = req.headers.endpoint;

        // Extract request token
        var queryData = url.parse(req.url, true).query;
        var requestToken = queryData.code;

        // Url to forward to
        var newUrl = endpoint + '/oauth/token';
        var redirect_uri = endpoint + '/oauth/verify';

        // Query string parameters
        var qs = {
            grant_type: 'authorization_code',
            client_id: 'api-client',
            client_secret: 'api-client',
            code: requestToken,
            redirect_uri: redirect_uri
        }

        // Make the request
        console.log("Forward oauth access token call to " + newUrl);
        console.log(JSON.stringify(qs));
        request({
            url: newUrl,
            qs: qs
        }).on('error', function (e) {
            res.end(e.toString());
        }).pipe(res);
    }
    else if (req.url.slice(0, 6) == '/rest/') {
        // Forward request to rest endpoint

        // Extract endpoint
        if (!req.headers.endpoint) {
            res.end('No endpoint url specified');
            return;
        }
        var endpoint = req.headers.endpoint;

        // Url to forward to
        var restPath = req.url.substring(5); // cut off /rest
        var newUrl = endpoint + restPath;

        // Set up required headers
        var headers = {
            'Accept': 'application/hal+json'
        }
        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        // Make the request
        console.log("Forward call to " + newUrl);
        request({
            url: newUrl,
            headers: headers
        }).on('error', function (e) {
            res.end(e.toString());
        }).pipe(res);
    }
    else {
        // Pass request to the application server
        request({
            url: "http://localhost:3000" + req.url
        }).on('error', function (e) {
            res.end(e.toString());
        }).pipe(res);
    }

}).listen(8001);
