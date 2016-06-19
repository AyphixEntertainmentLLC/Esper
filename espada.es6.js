class Controller {
	constructor(page) {
		this.route = page.route;
		this.app = page.app;
	}
}

class Request {
	static load_file(params) {
		var url = params.url;
		var loaded = params.loaded;
		console.log("loading file: " + url);
		$.ajax({
			url: url,
			success: (html) => {
				loaded(html);
			}
		}).
		fail(function(xhr, code, message) {
			throw "Unable to load request! Error Code: " + code + ", Message: " + message;
		});
	}
}

class Page {
	constructor(route, app) {
		this.base_content = "";
		this.content = "";
		this.controller = null;
		this.route = route;
		this.app = app;
		console.log("Created page");
	}

	start() {
		if (this.route != null && this.route != undefined) {
			Request.load_file({
				url: Uri.get_base_url() + this.app.path + "/" + this.route.view,
				loaded: (html) => {
					this.base_content = html;
					this.parse_page();
				}
			});
		} else {
			throw "Malformatted route! Page::start()";
		}
	}

	includes() {
		console.log("including files");
		var $page = this;
		$("include").each(function(){
			var	$this = $(this);
			
			Request.load_file({
				url: Uri.get_base_url() + $page.app.path + "/" + $this.attr("file"),
				loaded: (html) => {					
					$this.replaceWith(html);
				}
			});
		});
		this.finish();
	}
	
	on_load() {
		console.log("Page loaded, loading late files");
		var $page = this;
		$("onload").each(function(){
			var	$this = $(this);
			var type = $this.attr("type").toLowerCase();
			
			var src = null;
			
			switch(type.toLowerCase()) {
				case "script":
					src = $this.attr("src");
					$this.replaceWith("<script src='"+src+"'></script>");
					break;
			}
		});
	}
	
	finish() {
		this.on_load();
	}

	parse_page() {
		var reps = /\{\{(.*?)\}\}/g;
		if (this.base_content != null) {
			console.log("Parsing replaces");
			//this.content = this.base_content.replace(reps, "<span id='es-val-$1'></span>");
			this.content = this.base_content;
			this.render_page();
		}
	}

	render_page() {
		if (this.content != null) {
			if (this.route.controller != undefined && this.route.controller != null) {
				this.controller = new Controller(this);
				this.route.controller(this.controller);
			}
			console.log("Setting page html");
			$("view").html(this.content);
			//console.log(this.content);
			console.log("Done setting page html");
			this.includes();
		} else {
			throw "Content was null Page::render_page()";
		}
	}
}

class Router {
	constructor(app) {
		this.states = [];
		this.app = app;
		this.page = null;
	}

	set_routes(routes) {
		if (!$.isArray(routes)) {
			throw "route was not an array Router::set_routes()";
			return;
		}
		var app_states = this.states;
		$.each(routes, function(index, route) {
			if (route.url != undefined) {
				console.log(route.url);
				app_states[route.url] = route;
			} else {
				throw "Route.url was not defined Router::set_routes()";
			}
		});
		console.log("Set routes");
	}

	do_route() {
		var route = this.get_route(Uri.get_path());
		if (route != null && route != undefined) {
			console.log("This was a valid route: " + Uri.get_path() + ", Route: " + route.url);
			this.load_route(route);
		} else {
			route = this.get_route("/");
			if (route != null && route != undefined) {
				console.log("invalid route loading root");
				this.load_route(route);
			} else {
				throw "No route found exiting Router::do_route()";
			}
		}
	}

	load_route(route) {
		if (route.view != undefined) {
			console.log("creating page");
			this.page = new Page(route, this.app);
			this.route_start(this.page);
		} else {
			throw "Route undefined Router::load_route(route)";
		}
	}

	route_start(page) {
		if (page != null && page != undefined) {
			console.log("Starting page");
			page.start();
		} else {
			throw "Passed page was null Router::route_start()";
		}
	}

	get_route(url) {
		if (this.states[url] != undefined) {
			return this.states[url];
		} else {
			return null;
		}
	}
}

class Uri {
	static get_current_url() {
		var uri = window.location.href;
		
		var reg  = /((\w)*\.(\w)*)/g;
		
		uri = uri.replace(reg, "", uri);

		return uri;
	}
	
	static get_base_url() {
		var uri = Uri.get_current_url();
		if (uri.substring(uri.length - 1) == "/") {
			uri = uri.substring(0, uri.length - 1);
		}
		var index = uri.indexOf("#");
		if (uri.substring(uri.length - 1) != "/") {
			uri += "/";
		}
		if (index > -1) {
			return uri.substring(0, uri.indexOf("#"));
		} else {
			return uri;
		}
	}
	
	static get_path() {
		var uri = Uri.get_current_url();
		var index = uri.indexOf("#");
		if (index > -1) {
			uri = uri.substring(index);
		} else {
			uri = uri.replace(Uri.get_current_url(), "");
		}
		if (uri.substring(0, 1) == "#") {
			uri = uri.substring(1, uri.length);
		}
	
		if (uri == "" || uri == undefined || uri == null) {
			uri = "/";
		}
	
		return uri;
	}
}

class Application {
	constructor(name, app_path) {
		this.name = name;
		this.path = app_path;

		this.routes = new Router(this);

		$(window).on('hashchange', () => {
			this.routes.do_route();
		});
	}

	run(routes) {
		this.routes.set_routes(routes);
		this.routes.do_route();
	}
}