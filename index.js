var awis = require('awis');

// make telegram bot
var TelegramBot = require('node-telegram-bot-api');
var token = '<YOUR_BOT_TOKEN>';
var bot = new TelegramBot(token, {polling: true});

// confirm amazon web service user
var clientAWIS = awis({
  key: '<KEY_AWS_USER>',
  secret: '<SECRET_KEY_AWS_USER>',
});

bot.on('message', function (msg) {
    let chatId = msg.chat.id;
    // make request to awis
    clientAWIS({
		'Action': 'UrlInfo',
		'Url': msg.text,
		'ResponseGroup': 'Related,TrafficData,ContentData'
	}, function (err, data) {

		let related = [];

		// make related string		
		for (let i = 0; i < data.related.relatedLinks.relatedLink.length; i++) {
			if (i == 3) break;
			related.push(data.related.relatedLinks.relatedLink[i].dataUrl);
		}

		if (data.related.relatedLinks.relatedLink.length == 0) 
			related = 'not found'
		else 
			related = related.join(", ");
	    // send message to telegram bot
	    bot.sendMessage(chatId, "Title: " + data.contentData.siteData.title + 
	    	'\nRank: ' + data.trafficData.rank + 
	    	'\nAvg Load Time: ' + data.contentData.speed.medianLoadTime + 
	    	' ( ' + (100 - parseInt(data.contentData.speed.percentile)) +
	    	' of sites are faster)\nSimular Sites: ' + related + 
	    	'\nSites Link in: ' + data.contentData.linksInCount);
	});
});