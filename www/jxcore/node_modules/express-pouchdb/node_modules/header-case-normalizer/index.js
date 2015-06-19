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

"use strict";

module.exports = function (header) {
  //the exceptions
  var result = {
    "content-md5": "Content-MD5",
    "dnt": "DNT",
    "etag": "ETag",
    "last-event-id": "Last-Event-ID",
    "tcn": "TCN",
    "te": "TE",
    "www-authenticate": "WWW-Authenticate",
    "x-dnsprefetch-control": "X-DNSPrefetch-Control"
  }[header.toLowerCase()];
  if (result) {
    return result;
  }

  //the default
  return header
    .split("-")
    .map(function (text) {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    })
    .join("-");
};
