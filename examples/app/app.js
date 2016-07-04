// Project Espada HAS to be run on a web-server due to the Ajax requests it uses to load the views
var example_app = new Application("Example App", "app");

// These are the routes that Espada will have available to to it.
/*
	Generally a route will look this this below but the controller is optional.
	The url will look like http://example.com/
	if you have for example url: "/test" the url will look like http://example.com/index.html/#test
	or http://example.com/#/test
*/ 
var routes = [
	{
		url: "/",
		controller: main_controller,
		view: "views/main.html"
	},
	{
		url: "/includes",
		controller: null,
		view: "views/includes.html"
	}
];

// Pass our routes into our app and run it.
example_app.run(routes);