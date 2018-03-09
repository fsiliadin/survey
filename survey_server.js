var https = require('https')
var fs = require('fs')

var whiteList = ['css/', 'dependencies/', 'scripts/', 'index.html', 'checkMandatoryQuestions.js', 'survey.css']
var options = {
	key: fs.readFileSync('self-signedCertificate/key.pem'),
	cert: fs.readFileSync('self-signedCertificate/cert.pem')
}

https.createServer(options, function(request, response) {
	if (request.method === 'POST') {
		var data = '';
		request.on('data', function (chunk) {
			data += chunk;
		});
		request.on('end', function () {
			data = JSON.parse(data)
			console.log('DATA', data)
			// save data in DB
			response.end('thanks')
		});
	} else {
		request.url += request.url === '/' ? 'index.html' : ''
		
		if (isAuthorized(request.url)) {		
			fs.readFile('.'+request.url, function(err, file) {
				response.writeHead(200, {
					'Content-Type': getType(request.url)
		      	})
				response.end(file)
			})
		} else {
			console.log('UNAUTHORIZED REQUEST')
			response.writeHead(404, {
	      	})
	      	response.end('Page not found')
		}
	}
	
	
	
	
}).listen(process.env.PORT || 8086)

function getType (url) {
	return 'text/'+url.split('.').pop()
} 

function isAuthorized (url) {
	return whiteList.some(function(folder){
		return url.indexOf(folder) === 1
	})
}

console.log('ui server running at 127.0.0.1:' + (process.env.PORT || 8086))