
[Build]:    http://img.shields.io/travis/litejs/crypto-lite.png
[Coverage]: http://img.shields.io/coveralls/litejs/crypto-lite.png
[1]: https://travis-ci.org/litejs/crypto-lite
[2]: https://coveralls.io/r/litejs/crypto-lite
[4]: http://nodejs.org/api/crypto.html

    @version  0.0.4
    @date     2014-04-21

Standard cryptographic algorithms &ndash; [![Build][]][1] [![Coverage][]][2]
=================================

Lite version of sha1, sha256, hmac, pbkdf2 writen in javascript.


## How to use in browser

```html
<script src=crypto-lite.js></script>

<script>
crypto.sha1("secret")
// e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4
</script>
```


## How to use in node.js

Although it should work in node.js, you should [use native][4] api there.

npm install crypto-lite

```javascript
var crypto = require("crypto-lite").crypto

```


External links
--------------

- [npmjs.org/package/crypto-lite](https://npmjs.org/package/crypto-lite)

### Licence

Copyright (c) 2014 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt)


