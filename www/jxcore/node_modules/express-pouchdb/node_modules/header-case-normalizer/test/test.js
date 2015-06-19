/*
	Copyright 2014, Marten de Vries

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

/*global describe, it */

"use strict";

var chai = require("chai");
chai.should();

//python-pouchdb-js
var normalizeHeaderCase = require("../");

var headers = [
  //SOURCE: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
  "Accept",
  "Accept-Charset",
  "Accept-Features",
  "Accept-Encoding",
  "Accept-Language",
  "Accept-Ranges",
  "Access-Control-Allow-Credentials",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Headers",
  "Access-Control-Max-Age",
  "Access-Control-Expose-Headers",
  "Access-Control-Request-Method",
  "Access-Control-Request-Headers",
  "Age",
  "Allow",
  "Alternates",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Encoding",
  "Content-Language",
  "Content-Length",
  "Content-Location",
  "Content-MD5",
  "Content-Range",
  "Content-Type",
  "Cookie",
  "DNT",
  "Date",
  "ETag",
  "Expect",
  "Expires",
  "From",
  "Host",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Last-Event-ID",
  "Last-Modified",
  "Link",
  "Location",
  "Max-Forwards",
  "Negotiate",
  "Origin",
  "Pragma",
  "Proxy-Authenticate",
  "Proxy-Authorization",
  "Range",
  "Referer",
  "Retry-After",
  "Sec-Websocket-Extensions",
  "Sec-Websocket-Key",
  "Sec-Websocket-Origin",
  "Sec-Websocket-Protocol",
  "Sec-Websocket-Version",
  "Server",
  "Set-Cookie",
  "Set-Cookie2",
  "Strict-Transport-Security",
  "TCN",
  "TE",
  "Trailer",
  "Transfer-Encoding",
  "Upgrade",
  "User-Agent",
  "Variant-Vary",
  "Vary",
  "Via",
  "Warning",
  "WWW-Authenticate",
  "X-Content-Duration",
  "X-Content-Security-Policy",
  "X-DNSPrefetch-Control",
  "X-Frame-Options",
  "X-Requested-With"
];

describe("header tests", function () {
  headers.forEach(function (header) {
    var lowerCased = header.toLowerCase();
    it("should normalize the lowercased header '" + lowerCased + "'", function () {
      normalizeHeaderCase(lowerCased).should.equal(header);
    });
    var upperCased = header.toUpperCase();
    it("should normalize the uppercased header '" + upperCased + "'", function () {
      normalizeHeaderCase(upperCased).should.equal(header);
    });
  });
  it("should try to normalize an unknown header", function () {
    normalizeHeaderCase("x-unknown-header").should.equal("X-Unknown-Header");
  });
});

