'use strict';

require('dotenv').config({silent: true});
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const getPolicyDocument = function (effect, resource) {

    let policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    return policyDocument;
};


// extract and return the Bearer Token from the Lambda event parameters
const getToken = function (params) {
    if (!params.type || params.type !== 'TOKEN') {
        throw new Error("Expected 'event.type' parameter to have value TOKEN");
    }

    let tokenString = params.authorizationToken;
    if (!tokenString) {
        throw new Error("Expected 'event.authorizationToken' parameter to be set");
    }

    let match = tokenString.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
        throw new Error("Invalid Authorization token - '" + tokenString + "' does not match 'Bearer .*'");
    }
    return match[1];
};

module.exports.authenticate = function (params, cb) {
    console.log(params);
    let token = getToken(params);

    const client = jwksClient({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10, // Default value
        jwksUri: process.env.JWKS_URI
    });

    const decoded = jwt.decode(token, {complete: true});
    const kid = decoded.header.kid;
    client.getSigningKey(kid, function (err, key) {
        if (err) {
            cb(err);
        }
        else {
            const signingKey = key.publicKey || key.rsaPublicKey;
            jwt.verify(token, signingKey, {audience: process.env.AUDIENCE, issuer: process.env.TOKEN_ISSUER},
                function (err, decoded) {
                    if (err) {
                        cb(err);

                    }
                    else {

                        cb(null, {
                            principalId: decoded.sub,
                            policyDocument: getPolicyDocument('Allow', params.methodArn),
                            context: {
                                scope: decoded.scope
                            }
                        });
                    }
                });
        }
    });
};