var request = require("request"),
	_ = require("underscore"),
	striptags = require("striptags"),
	querystring = require("querystring"),
	entities = require("entities"),
	iconv = require('iconv-lite'),
	https = require('https');


module.exports = function (opts, callback) {
	opts = _.defaults(opts, {
		text: "text",
		source: "en",
		target: "es"
	});

	var url = "https://translate.google.com/";

	var data = {
		"sl": querystring.escape(opts.source),
		"tl": querystring.escape(opts.target),
		"js": querystring.escape("n"),
		"prev": querystring.escape("_t"),
		"hl": querystring.escape(opts.source),
		"ie": querystring.escape("utf-8"),
		"text": opts.text,
		"file": querystring.escape(""),
		"edit-text": querystring.escape("")
	};
	var getUrl = url + "?" + querystring.stringify(data);
	https.get(getUrl, function (res) {
		var chunks = [];
		res.on('data', function (chunk) {
			chunks.push(chunk);
		});
		res.on('end', function () {
			var decodedBody = iconv.decode(Buffer.concat(chunks), 'win1252');
			var matches = decodedBody.match(/\<span id=result_box(.*?)\<\/span><\/div>/g);
			var translation = matches[0];
			translation = entities.decode(translation);
			translation = striptags(translation);
			callback(translation);
		});
	});
};
