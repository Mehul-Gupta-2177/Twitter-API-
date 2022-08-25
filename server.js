const http = require('http');
const fs = require('fs');
const path = require('path');
const diag = require("./diag.js");
const formidable = require('formidable');
const needle = require('needle');
const token = 'AAAAAAAAAAAAAAAAAAAAAKE8dAEAAAAANllwOxH0ofW7Ow4HYqW68%2FVuyvA%3DQRq2RxsNoU1DlfLQzuLfexPq8UZ0wSQX1hwGTJwBMaeDvbTQLt';
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
const { fork } = require("child_process");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://admin:admin_123@data.fg12n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const language = require('@google-cloud/language')
const client = new language.LanguageServiceClient();

let is_tweet_completed = false;
let is_Diagnostic_completed = false;
let chart1 = ``;
let chart2 = ``;
let chart3 = ``;
http.createServer(function(req, res) {
    if (req.url == "/") {
        // home page
        console.log("requesting index");
        let index = "Twitter.html";
        fs.readFile(index, function(err, txt) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(txt);
            res.end();
        });
    } else if (req.url == "/Twitter") {
        // venue page
        console.log("On Twitter Page");

        if (req.method.toLowerCase() == "post") {
            // Twitter submission form submitted
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) { console.log(err); }
                // add code to use API
                let index = "Loading.html";
                fs.readFile(index, function(err, txt) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(txt);
                    console.log(req.url);
                    res.end();
                });
                const child = fork("func.js",[fields["Name"].toLowerCase(), fields["context"]]);
                child.on("close", function (code) {
                    console.log("child process exited with code " + code);
                    is_tweet_completed = true;
                    console.log(is_tweet_completed);

                  });
            });
        }
        
        else {
            let index = "Twitter.html";
            fs.readFile(index, function(err, txt) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(txt);
                res.end();
            });
        }
    }
    else if(req.url == "/Loading")
    {
        if (req.method.toLowerCase() == "post") {
            // Twitter submission form submitted
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) { console.log(err); }
                // add code to use API
                if(is_tweet_completed)
                {
                    let index = "Loading.html";
                    fs.readFile(index, function(err, txt) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(txt);
                        let temp_button_text = `<button onclick=\\\"location.href =\\\'\/TwitterDiag\\\';\\\" id=\\\"Button1\\\" class=\\\"button1\\\" >Go to Diagnostic Page<br> <\/button>`
                        let text_temp_overall = `<script>  document.getElementById(\"Goto\").innerHTML = \"${temp_button_text}\";  <\/script> `
                        res.write(text_temp_overall)
                        res.end();
                        
                    });
                }
                else
                {
                    let index = "Loading.html";
                    fs.readFile(index, function(err, txt) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(txt);
                    let text_temp = `<script>  document.getElementById(\"Goto\").innerHTML = \"Still Loading, Check status in a little while\";  <\/script> `
                    res.write(text_temp);
                    console.log(req.url);
                    res.end();
                    
                    });
                }
            });
        }
        else
        {
            let index = "Loading.html";
            fs.readFile(index, function(err, txt) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(txt);
                console.log(req.url);
                res.end();
            });
        }
    }
    else if (req.url == "/TwitterDiag") {
        // venue page
        console.log("On TwitterDiag Page");

        if (req.method.toLowerCase() == "post") {
            // Twitter submission form submitted

            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) { console.log(err); }
                // add code to use 
                // Get data from MongoDB for a tag
                // process data with buzzword
                // Give out diagnostic on the next page
                // write here now but move to another file for the mongoclient connect
                let Tag_name = fields["Tag"].toUpperCase();
                let wordSearch = fields["Word"].toLowerCase();
                // callback from the diag file to go to the dashboard
                let index = "LoadingDash.html";
                fs.readFile(index, function(err, txt) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(txt);
                    console.log(req.url);
                    res.end();
                });
                await diag.GetDiagnostic(Tag_name,wordSearch, async function(percentage, array) {
                    console.log(percentage);

                    // Now analyse the array item by item.

                    // After Doing Analysis to get positves and negatives and neutrals
                    await diag.DoAnalysis(array, function(result_numerical, result_category)
                    {
                        let pos = result_numerical[0];
                        let neg = result_numerical[1];
                        let neutral = result_numerical[2];
                        let num_cat = 10;
                        if(result_category.length < 10)
                        {
                            num_cat = result_category.length;
                        }
                        let chart3_text = `\"`;
                        for(i = 0; i < num_cat; i++ )
                        {
                            let str = result_category[i].replace("\\", " ");
                            list_num = i + 1;
                            chart3_text = chart3_text + `<p>${list_num}. ${str} <\/p> <br>`; 
                        }
                        chart3_text = chart3_text + `\"`
                         chart3 =   `<script>  document.getElementById(\"Chart3\").innerHTML = ${chart3_text};  <\/script> `

                            // This Works Now after using callback
                            // Can make an array of different percentages before usign callback
                            // by making an array of words etc.
                            // Use BERT library
                            var word = wordSearch;
                            var number = percentage;
                            var other_number = 100 - percentage;
                            chart1 = `<script>\n  var xValues = [\"${word}\", \"Other\"];\n  var yValues = [${number}, ${other_number}];\n  var barColors = [\n    \"#b91d47\",\n    \"#00aba9\",\n  ];\n  \n  new Chart(\"myChart\", {\n    type: \"pie\",\n    data: {\n      labels: xValues,\n      datasets: [{\n        backgroundColor: barColors,\n        data: yValues\n      }]\n    },\n    options: {\n      title: {\n        display: true,\n        text: \"Tweeted Word Usage Diagnostic\"\n      }\n    }\n  });\n  <\/script>`
                            chart2 = `<script>\nvar xValues = [\"Positive\", \"Neutral\", \"Negative\"];\nvar yValues = [${pos}, ${neutral}, ${neg},0];\nvar barColors = [\"red\", \"green\",\"blue\"];\n\nnew Chart(\"myChart2\", {\n  type: \"bar\",\n  data: {\n    labels: xValues,\n    datasets: [{\n      backgroundColor: barColors,\n      data: yValues\n    }]\n  },\n  options: {\n    legend: {display: false},\n    title: {\n      display: true,\n      text: \"Tweet Analysis\"\n    }\n  }\n});\n<\/script>`
                            is_Diagnostic_completed = true;
                    });

                 });
            });
        }      
        else {
            let index = "TwitterDiag.html";
            fs.readFile(index, function(err, txt) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(txt);
                res.end();
            });
        }
    }
    else if(req.url == "/LoadingDash")
    {
        if (req.method.toLowerCase() == "post") {
            // Twitter submission form submitted
            var form = new formidable.IncomingForm();
            form.parse(req, async function(err, fields, files) {
                if (err) { console.log(err); }
                // add code to use API
                if(is_Diagnostic_completed)
                {
                    let index = "Dashboard.html";
                    fs.readFile(index, function(err, txt) {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(txt);
                        res.write(chart1);
                        res.write(chart2);
                        res.write(chart3);
                        res.end();
                        
                    });
                }
                else
                {
                    let index = "LoadingDash.html";
                    fs.readFile(index, function(err, txt) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(txt);
                    res.end();
                    
                    });
                }
            });
        }
    }

}).listen(process.env.PORT || 8080);

