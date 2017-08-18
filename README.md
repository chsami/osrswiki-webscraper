# osrswiki-webscraper
Nodejs Wiki Webscraper for the online MMORPG Oldschool Runescape

# osrs wiki webscraper

> Find a file or directory by walking up parent directories


## Install

```
$ npm install --save
```


## Usage

```
/
└── osrswiki-webscraper
		└── server.js
    
```

```js
// example.js
const findUp = require('find-up');

findUp('unicorn.png').then(filepath => {
	console.log(filepath);
	//=> '/Users/sindresorhus/unicorn.png'
});

findUp(['rainbow.png', 'unicorn.png']).then(filepath => {
	console.log(filepath);
	//=> '/Users/sindresorhus/unicorn.png'
});
```


## API

example:
localhost/scrape/dark beast


## License

MIT © [Chkhachkhi Sami]
