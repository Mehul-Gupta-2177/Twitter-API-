const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const needle = require('needle');
const token = 'AAAAAAAAAAAAAAAAAAAAAKE8dAEAAAAANllwOxH0ofW7Ow4HYqW68%2FVuyvA%3DQRq2RxsNoU1DlfLQzuLfexPq8UZ0wSQX1hwGTJwBMaeDvbTQLt';
const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

http.createServer(function (req, res) {
    if(req.url == "/"){
        // home page
        console.log("requesting index");

        let index = "Twitter.html";
        fs.readFile(index, function (err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(txt);
            res.end();
        });
    }
    else if (req.url == "/Twitter") {
        // venue page
        console.log("On Twitter Page");

        if (req.method.toLowerCase() == "post") {
            // Twitter submission form submitted
            var form = new formidable.IncomingForm();
            form.parse(req, async function (err, fields, files) {
                if (err) {console.log(err);}
                // add code to use API
                const query_param = fields['Name']
                
                const params = {
                    // backticks for template literals
                    'query': `from: ${query_param} -is:retweet -is:reply`,
                    'user.fields': 'username'
                }
            
                const res = await needle('get', endpointUrl, params, {
                    headers: {
                        "User-Agent": "v2RecentSearchJS",
                        "authorization": `Bearer ${token}`
                    }
                })
            
                if (res.body) {
                    console.log(res.body);
                } else {
                    throw new Error('Unsuccessful request');
                }
            });
        }
        else {
            let index = "Twitter.html";
            fs.readFile(index, function (err, txt) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(txt);
                res.end();
            });
        }
    }
}).listen(process.env.PORT || 8081);
