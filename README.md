# Node.js bolerplate for building singlepage web apps

This is a node.js [boilerplate](http://en.wikipedia.org/wiki/Boilerplate_code) for building singlepage web applications. It is not a library or a reusable module. It is a repo you can [fork](https://help.github.com/articles/fork-a-repo) and use as a starting point for a new project.

This is a boilerplate used as the fundamental structure to develop and serve singlepage applications at [A-Media AS](http://amedia.no/?page_id=16).


## Why and what is this?

By our definition singlepage web applications is build by html, css, javascript and graphics. In a singlepage web application all rendering and logic happens in the browser. The singlepage web application get all its data as JSON from REST APIs or through a socket or long polling connection.

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

When serving it to our users, we want it too look like this:

```html
<!doctype html><html manifest="manifest.appcache"><head><meta charset="utf-8"><title>Awesome App</title><link href="css/app.min.css" rel="stylesheet"></head><body><h1 id="head">Nice app</h1><div id="main"></div><footer id="foot"></footer><script src="js/app.min.js"></script></body></html>
```