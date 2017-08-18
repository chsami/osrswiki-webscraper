var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var npcData = readNpcFile("npcdrops.json");
var npcImages = readNpcFile("npcimages.json");



function readNpcFile(fileName) {
    try {
        var obj = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (ex) {
        console.log("error reading npcdrops.json");
    }

    if (obj == undefined) {
        obj = [];
    }
    deleteNpcFile();
    return obj;
}

function deleteNpcFile() {
    fs.unlink('npcdrops.json', (err) => {
        if (err)
            console.log(err);
        //succesfully message here
    });
}
//C:\Users\SaCh\Documents\Nodejs\WebScraper

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/test', function (req, res) {
    var obj = new Object();
    obj.name = {};
    obj.name.drops = { test: ["scimmy", "arrow"] };
    console.log(obj.name.drops);
    res.end("finished!");
});

app.get('/scrape/:uid', function (req, res) {

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html
    var response = res;
    var npcName = req.params.uid.toLowerCase();
    //var npcDrops = readNpcFile("npcdrops.json");
    

    function finishRequest() {
        let result = {};

        result.drops = npcData[npcName].drops;
        result.images = npcImages[npcName];
        response.json(result);
    }

    request("http://oldschoolrunescape.wikia.com/wiki/" + npcName, function (error, response, html) {
        // First we'll check to make sure no errors occurred when making the request

        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            var npcInfo = {
                drop: function () {
                    // Finally, we'll define the variables we're going to capture
                    let drops = $('#mw-content-text > dl > dd > table > tbody > tr > td > a');
                    npcData[npcName] = {};
                    npcData[npcName].drops = [{}];

                    let counter = 0;

                    //load all the drops into a collection
                    drops.each(function (key) {
                        if (key % 2 == 0) {
                            npcData[npcName].drops[counter] = {};
                            let quantity = $(this).parent().parent().find("td:nth-child(3)").html();
                            let rarity = $(this).parent().parent().find("td:nth-child(4)").html();
                            let price = $(this).parent().parent().find("td:nth-child(5)").html();
                            quantity = quantity.substring(0, quantity.length - 1);
                            rarity = rarity.substring(0, rarity.length - 1);
                            npcData[npcName].drops[counter].name = $(this).attr("title");
                            npcData[npcName].drops[counter].quantity = quantity.trim();
                            npcData[npcName].drops[counter].icon = $(this).parent().parent().find("td:nth-child(1)").find("img").attr("data-src");
                            npcData[npcName].drops[counter].rarity = rarity.trim();
                            npcData[npcName].drops[counter].price = price.trim();
                            counter++
                        }
                    });

                    // we want to create a json file and store all the drops in it
                    fs.writeFile("npcdrops.json", JSON.stringify(npcData), function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                },
                image: function () {
                    // Finally, we'll define the variables we're going to capture
                    let image = $('.infobox-wrapper > table > tbody > tr:nth-child(1) > td > a > img');
                    npcImages[npcName] = [];

                    npcImages[npcName].push(image.attr("src"));

                    // we want to create a json file and store all the drops in it
                    fs.writeFile("npcimages.json", JSON.stringify(npcImages), function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });
                    //console.log(npcImages);
                }
            }

            npcInfo.drop(); //get the drops of a npc
            npcInfo.image(); //get the images of a npc


            if (response.statusCode == 200) {
                finishRequest();
            }
        }
    });
});

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;