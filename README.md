# Node.js boilerplate for building singlepage web apps

This is a node.js [boilerplate](http://en.wikipedia.org/wiki/Boilerplate_code) for building singlepage web applications. It is not a library or a reusable module. It is a repo you can [fork](https://help.github.com/articles/fork-a-repo) and use as a starting point for a new project. It is intended that you will tweak and adjust files and directories in this repo so it fits your needs.

This is a boilerplate used as the fundamental structure to develop and serve singlepage applications at [A-Media AS](http://amedia.no/?page_id=16).


## Why?

By our definition singlepage web applications is build by html, css, javascript and graphics. In a singlepage web application all rendering and logic happens in the browser. The singlepage web application get all its data as JSON from REST APIs or through socket or long polling connections.

No rendering of markup is done on the server. The servers role is to serve the singlepage web application as static files and provide data access in form of a REST API or a socket or long polling connection.

Given this definition the developer(s) coding the singlepage web application will be working only with code executed in the browser. During development it is desirable to keep a certain structure of our code. We want to separate and slice up the css, graphics and javascripts so its easy to maintain our code.

Though; when serving the singlepage web application to our users we want to concatinate, minify and make sure its optimized for fast deliverance to our users.

In other words; in development we want our code to look like this:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="css/core.css">
  <link rel="stylesheet" href="css/module1.css">
  <link rel="stylesheet" href="css/module2.css">
  <title>Awesome App</title>
</head>
<body>
  <h1 id="head">Nice app</h1>
  <div id="main"> </div>
  <footer id="foot"> </footer>

  <!-- JavaScripts here -->
  <script src="js/core.js"></script>
  <script src="js/module1.js"></script>
  <script src="js/module2.js"></script>
</body>
</html>
```

When serving it to our users, we want it to look like this:

```html
<!doctype html><html manifest="manifest.appcache"><head><meta charset="utf-8"><title>Awesome App</title><link href="css/app.min.css" rel="stylesheet"></head><body><h1 id="head">Nice app</h1><div id="main"></div><footer id="foot"></footer><script src="js/app.min.js"></script></body></html>
```

There is [plenty of](http://developer.yahoo.com/performance/rules.html) [reasons why](https://developers.google.com/speed/docs/best-practices/rules_intro) [we want to serve our application like this](http://calendar.perfplanet.com/).


## What?

This boilerplate consist of two parts: a build script and a server which will act as a http server and possibly a REST API / socket / long polling provider.

### The server

The server, [node.js](http://nodejs.org/), will act as a http server serving all static files from a source directory in development.

By putting the server in a production environment, the same server will serve the pre built singlepage web application.

Any REST API, sockets or long polling connections you implement in the server will then have the same relative URLs in both development and production. This laverage the difference between development and production and makes it possible to work on separate files in development and having a highly optimized web application served in production.

It is very easy to switch to serving the pre build web application in development so one can test that everything is as it should after the build process.

### The build script

The build script will take the index.html file in the source directory and analyze its content. Based on what it finds, the script it will:

 - Create a build located in the dist directory. The source directory will be left untouched.
 - Take all references to local .js files and concatinate the files into one .js file. In the index.html file, the DOM elements refering to the previous .js files will be removed and replaced with a new DOM element refering to the concatinated .js file.
 - Minify the concatinated .js file with the latest version of [UglifyJS](https://github.com/mishoo/UglifyJS2).
 - Take all references to local .css files and concatinate the files into one .css file. In the index.html file, the DOM elements refering to the previous .css files will be removed and replaced with a new DOM element refering to the concatinated .css file.
 - Minify the concatinated .css file with the latest version of [clean-css](https://github.com/GoalSmashers/clean-css).
 - Base64 encode all graphics under 4k in size refered to in the .css files replaced the reference with a [data URI](http://en.wikipedia.org/wiki/Data_URI_scheme) holding the base64 encoded version.
 - Remove all whitespace between tags in index.html. Child elements of pre and textinput tags will be left untouched.
 - Fix semantic errors in the index.html.
 - Minify all inline javascript and css with the same minifying tools used for minifying the .js and .css files.
 - Create an application.cache manifest file which holds a reference to the files put in the dist directory and append a reference to it in the index.html file.

### Why a build process?

This could be done on run time by the server in production. A build process removes the need for running such a process run time and leaves the server to just serve static files and provide data access. Iow: lett to do for the server.

A very good reason why one would like to build a package of files is that the build can be gziped and uploaded to services such as [PhoneGap Build](https://build.phonegap.com/) to produce instalable iOS, Android, Win etc applications.

The same gzipped package can also go into web application stores such as [Google Web Store](https://chrome.google.com/webstore/) and [Mozilla Marketplace](http://www.mozilla.org/en-US/apps/) etc.