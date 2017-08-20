var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var rp = require('request-promise');
var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/*
,
    
*/



app.get('/scrape/:uid', function (req, res) {

    let request = {};

    request.data = {
        npcName: '',
        drops: [{}],
        imgData: '',
        dropsQuery: "#mw-content-text > dl > dd > table > tbody > tr > td > a",
        imgQuery: ".infobox-wrapper > table > tbody > tr:nth-child(1) > td > a > img"
    }

    request.options = {
        uri: "http://oldschoolrunescape.wikia.com/wiki/",
        transform: function (body) {
            return cheerio.load(body);
        }
    }



    request.create = function (npcName) {
        request.options.uri += npcName
        return rp(request.options)
            .then(function ($) {
                return $;
            }).catch(function (err) {

            });
    }

    request.scrapeDrops = function ($) {
        let counter = 0;
        let dropsHTML = $(request.data.dropsQuery);
        dropsHTML.each(function (key) {
            //for some reason we get duplicates, so we can easily filter them out with modulo 2
            if (key % 2 == 0) {

                //init
                request.data.drops[counter] = {
                    name: '',
                    quantity: 0,
                    icon: '',
                    rarity: 0,
                    price: 0
                };

                //load
                let name = $(this).attr("title");
                let icon = $(this).parent().parent().find("td:nth-child(1)").find("img").attr("data-src");
                let quantity = $(this).parent().parent().find("td:nth-child(3)").html();
                quantity = quantity.substring(0, quantity.length - 1);
                let rarity = $(this).parent().parent().find("td:nth-child(4)").html();
                rarity = rarity.substring(0, rarity.length - 1);
                let price = $(this).parent().parent().find("td:nth-child(5)").html();

                //set
                request.data.drops[counter].name = name
                request.data.drops[counter].icon = icon
                request.data.drops[counter].quantity = quantity
                request.data.drops[counter].rarity = rarity
                request.data.drops[counter].price = price;
                counter++;
            }
        });
    }

    request.scrapeImages = function ($) {
        let imageHTML = $(request.data.imgQuery);
        request.data.imgData = imageHTML.attr("src");
    }

    request.create(req.params.uid.toLowerCase()).then(function ($) {
        request.scrapeDrops($);
        request.scrapeImages($);
    }).then(function () {
        res.json(request.data.drops);
    }).error(function (error) {
        res.end(error);
    });
});

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;