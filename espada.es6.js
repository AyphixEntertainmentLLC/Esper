class Controller {
	constructor(page) {
		this.route = page.route;
		this.app = page.app;
	}
	
	url() {
		return Uri.url();
	}
	
	compile(code) {
		return this.evalInContext(code, this);
	}
	
	evalInContext(js, context) {
	    //# Return the results of the in-line anonymous function we .call with the passed context
	    return function() { return eval(js); }.call(context);
	}
	
	request(params) {
		Request.post(params);
	}
}

class Request {
	static load_file(params) {
		jQuery.ajaxSetup({async:false});
		var url = params.url;
		var loaded = params.loaded;
		console.log("loading file: " + url);
		$.ajax({
			url: url,
			success: (html) => {
				jQuery.ajaxSetup({async:true});
				loaded(html);				
			}
		}).
		fail(function(xhr, code, message) {
			throw Error("Unable to load request! Error Code: " + code + ", Message: " + message);
		});
	}
	
	static post(params) {
		var url = "";
		if(params.url     != undefined) {
			url = params.url;
		}
		
		var method = "get";
		if(params.method  != undefined) {
			method = params.method;
		}
		
		var data = "";
		if(params.data    != undefined) {
			data = $.param(params.data);
		}
		
		var success = function() { throw Error("Request returned a success but no success callback was set."); };		
		var fail    = function() { throw Error("Request returned a failure but no success callback was set."); };
		var error   = function() { throw Error("Request returned an error but no error callback was set.");    };
		
		if(params.success != undefined) {
			success = params.success;
		}
		
		if(params.fail    != undefined) {
			fail = params.fail;
		}
		
		if(params.error   != undefined) {
			error = params.error;
		}
		
		console.log("Ajax Call: " + url);
		
		$.ajax({
			url: url,
			method: method,
			data: data,
			success: (res) => {
				if(res != null && res != undefined) {
					if(res.status) {
						success(res);
					}else{
						fail(res);
					}
				}else {
					error("");
				}
			},
			error: (response) => {
				fail(response);
			}
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
				async: false,
				loaded: (html) => {
					this.base_content = html;
					this.render_page();
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
			
			switch(type.toLowerCase().replace(" ", "")) {
				case "python":
				case "ruby":
				case "jscript":
				case "javascript":
				case "js":
				case "script":
					src = $this.attr("src");
					$this.replaceWith("<script src='"+src+"'></script>");
					break;
				case "css1":
				case "css2":
				case "css3":
				case "stylesheet":
				case "style":
				case "css":
					src = $this.attr("src");
					$this.replaceWith("<link rel='stylesheet' href='"+src+"'>");
					break;
			}
		});
	}
	
	generate_hooks() {
		console.log("Generating hooks");
		let $page = this;
		setTimeout(function() {
			$('a').each(function(i, e) {
				let $this = $(this);
				let href = $this.attr("esref");
				if(href != null && href != undefined) {
					$this.attr("href", Uri.get_base_url() + "#" + href);
					console.log(href);
				}
				if(href == Uri.get_path()) {
					$this.addClass($this.attr("es-active"));
				}else{
					$this.removeClass($this.attr("es-active"));
				}
			});
			
			let actives = $("[es-active]");
			
			actives.each(function() {
				let $parent = $(this);
				$(this).find("a").each(function(i, e) {
					let $this = $(this);
					let href = $this.attr("esref");
					if(href == Uri.get_path()) {
						$parent.addClass($parent.attr("es-active"));
					}else{
						$parent.removeClass($parent.attr("es-active"));
					}
				});
			});
		}, 0);
	}
	
	finish() {
		this.generate_hooks();
		this.parse_page();		
		this.on_load();
	}
	
	get_html() {
	    var r = document.documentElement.innerHTML, t = document.documentElement.attributes, i = 0, l = '',
	        d = '<!DOCTYPE ' + document.doctype.name + (document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : '') + (!document.doctype.publicId && document.doctype.systemId ? ' SYSTEM' : '') + (document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : '') + '>';
	    for (; i < t.length; i += 1) l += ' ' + t[i].name + '="' + t[i].value + '"';
	    return d+'\n<html' + l + '>' + r + '</html>';
	}

	parse_page() {
		var reps = /(\{\{(.*?)\}\})/g; 
		console.log("Parsing replaces");
		var doc = $("html");
		var cont = this.get_html();
		var m;
		while((m = reps.exec(cont)) !== null) {
				var rep = this.controller.compile(m[1]);
				cont = cont.replace(m[0], rep);
		}
		document.documentElement.innerHTML = cont;
	}

	render_page() {
		if (this.content != null) {
			this.controller = new Controller(this);
			if (this.route.controller != undefined && this.route.controller != null) {
				console.log(typeof this.route.controller == Controller);
				this.route.controller(this.controller);
			}
			console.log("Setting page html");
			//this.content = this.base_content;
			$("view").html(this.base_content);
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
				console.log("invalid route loading root route('/')");
				this.load_route(route);
			} else {
				throw "No root route('/') found exiting Router::do_route()";
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
		
		var reg  = /((\w)*\.(php|html|py|jsp|htm|rb))/g;
		
		uri = uri.replace(reg, "", uri);

		return uri;
	}
	
	static url() {
		return Uri.get_base_url();
	}
	
	static get_base_url() {
		var uri = Uri.get_current_url();
		if (uri.substring(uri.length - 1) == "/") {
			uri = uri.substring(0, uri.length - 1);
		}
		
		var ind = uri.indexOf("?");
		if(ind > -1) {
			uri = uri.substring(0, ind);
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