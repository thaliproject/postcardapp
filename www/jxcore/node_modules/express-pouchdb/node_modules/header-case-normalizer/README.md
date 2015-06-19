header-case-normalizer
======================

HTTP headers are case insensitive. That's why NodeJS makes them lower
case by default. While sensible, sometimes, for example for
compatibility reasons, you might need them in their more common form.
This library converts them:

	var normalizeHeaderCase = require("header-case-normalizer");
	normalizeHeaderCase("user-agent") //-> "User-Agent"

Tested with a list from MDN.
