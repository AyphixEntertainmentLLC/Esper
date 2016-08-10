/**
 * ----------------------------------------------------------------------------
 * This class handles misc functions that don't fit anywhere else or sh-
 * ould be accessible anywhere even by the library user.
 * ----------------------------------------------------------------------------
 * @class
 * @module Utilities
 * @public
 * @static
 * @this Uri
 * @author Jïn Muhjo
 */
class $_ {
	/**
	 * ----------------------------------------------------------------------------
	 * This checks to see if a parameter passed in is not null or undefined
	 * ----------------------------------------------------------------------------
	 * @function 
	 * @module $_
	 * @public
	 * @static
	 * @author Jïn Muhjo
	 */
	static nullOrUndef(param) {
		if (param != null && param !== undefined) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * ----------------------------------------------------------------------------
 * This class handles anything to do with the current URL
 * ----------------------------------------------------------------------------
 * @class
 * @module Utilities
 * @public
 * @this Uri
 * @author Jïn Muhjo
 */
class Uri {
	/**
	 * ----------------------------------------------------------------------------
	 * This get's the current unaltered URL
	 * ----------------------------------------------------------------------------
	 * @function 
	 * @module Utilities
	 * @public
	 * @static
	 * @author Jïn Muhjo
	 */
	static get_url() {
		return window.location.href;
	}
	/**
	 * ----------------------------------------------------------------------------
	 * This get's the current URL without the current document or action-
	 * s
	 * ----------------------------------------------------------------------------
	 * @function 
	 * @module Utilities
	 * @public
	 * @static
	 * @author Jïn Muhjo
	 */
	static get_base_url() {
		var url = Uri.get_url();
		url = url.replace(/((\w)*(\.((html|htm)|php|css|js|less|scss|xhtml|rb|py|jsp))(.*)*)/g, "");
		return url;
	}
	/**
	 * ----------------------------------------------------------------------------
	 * This get's the current URL without the base URL or document
	 * ----------------------------------------------------------------------------
	 * @function 
	 * @module Utilities
	 * @public
	 * @static
	 * @author Jïn Muhjo
	 */
	static get_action() {
		var url = Uri.get_url();
		url = url.replace(/(http|https)\:\/\/([\w\/\.])*(\.(html|htm)|php|css|js|less|scss|xhtml|rb|py|jsp)?\#?/g, "");
		if (url === "") {
			url = "/";
		}
		return url;
	}
}

/**
 * ----------------------------------------------------------------------------
 * This class handles misc functions that don't fit anywhere else or sh-
 * ould be accessible anywhere even by the library user.
 * ----------------------------------------------------------------------------
 * @class
 * @module Utilities
 * @public
 * @static
 * @this Uri
 * @author Jïn Muhjo
 */
class RouteMap {
	constructor() {
		this.map = [];
	}

	add(key1, key2, value) {
		if(this.get(key1) === undefined && this.get(key2) === undefined) {
			this.map.push({
				keys : [ key1, key2 ],
				value : value
			});
			return true;
		}else{
			return false;
		}
	}

	remove(key) {
		$.each(this.map, function(i, e) {
			if ($_.nullOrUndef(e.keys[key])) {
				this.slice(i);
			}
		});
	}

	get(key) {
		let $this = this;
		let route = undefined;
		$.each(this.map, function(i, e) {
			$.each(e.keys, function(j,k) {
				if (k == key) {
					route =  $this.map[i].value;
				}
			});
		});
		return route;
	}
}

/**
 * ----------------------------------------------------------------------------
 * This class handles misc functions that don't fit anywhere else or sh-
 * ould be accessible anywhere even by the library user.
 * ----------------------------------------------------------------------------
 * @class
 * @module Utilities
 * @public
 * @static
 * @this Uri
 * @author Jïn Muhjo
 */
class Request {
	static load_file(params) {
		jQuery.ajaxSetup({async:false});
		var url = params.url;
		var loaded = params.loaded;
		console.log("loading file: " + url);
		$.ajax({
			url: url,
			success: function (html) {
				jQuery.ajaxSetup({async:true});
				loaded(html);				
			}
		}).
		fail(function(xhr, code, message) {
			throw new Error("Unable to load request! Error Code: " + code + ", Message: " + message);
		});
	}
	
	static post(params) {
		var url = "";
		if($_.nullOrUndef(params.url)) {
			url = params.url;
		}
		
		var method = "get";
		if($_.nullOrUndef(params.method)) {
			method = params.method;
		}
		
		var data = "";
		if($_.nullOrUndef(params.data)) {
			data = $.param(params.data);
		}
		
		var success = function() { throw new Error("Request returned a success but no success callback was set."); };		
		var fail    = function() { throw new Error("Request returned a failure but no success callback was set."); };
		var error   = function() { throw new Error("Request returned an error but no error callback was set.");    };
		
		if($_.nullOrUndef(params.success)) {
			success = params.success;
		}
		
		if($_.nullOrUndef(params.fail)) {
			fail = params.fail;
		}
		
		if($_.nullOrUndef(params.error)) {
			error = params.error;
		}
		
		console.log("Ajax Call: " + url);
		
		$.ajax({
			url: url,
			method: method,
			data: data,
			success: function (res) {
				if($_.nullOrUndef(res)) {
					if(res.status) {
						success(res);
					}else{
						fail(res);
					}
				}else {
					new Error("");
				}
			},
			error: function (response) {
				fail(response);
			}
		});
	}
}

/**
 * -----------------------------------------------------------------------------
 * This class runs our application it handles everything from checking
 * the current route to rendering the page.
 * -----------------------------------------------------------------------------
 * @class
 * @module Application
 * @public
 * @this Application
 * @author Jïn Muhjo
 */
class Application {
	constructor(name) {
		this.name = name;
		this.$rootScope = {};
		this.router = new Router(this.$rootScope);
		
		let $this = this;
		
		$(window).on('hashchange', function() {
			console.log("route change");
			$this.router.handle();
		});
	}
	
	setRoutes(routes) {
		this.router.setRoutes(routes);
	}
	
	run(rootScope) {
		//console.log(Uri.get_base_url());
		rootScope(this.$rootScope);
		this.router.handle();
	}
}

class Controller {
	constructor($rootScope) {
		this.$rootScope = $rootScope;
	}
}

/**
 * ------------------------------------------------------------------------------
 * This class runs our application it handles everything from checking
 * the current route to rendering the page.
 * ------------------------------------------------------------------------------
 * @class
 * @module Application
 * @public
 * @this Pages
 * @author Jïn Muhjo
 */
class Page {
	constructor($rootScope, $route) {
		this.controller = new Controller($rootScope);
		this.$route = $route;
		if($_.nullOrUndef($route.controller)) {
			this.$scope = $route.controller;
		}
	}
	
	title(title) {
		$("title").text(title);
	}
	
	run() {
		if($_.nullOrUndef(this.$scope)) {
			console.log("creating controller");
			this.$scope(this.controller);
		}
		this.$apply();
	}
	
	$apply(func) {
		//this.eval();
		console.log("Applying changes");
		this.include();
		if ($_.nullOrUndef(func)) {
			func();
		}
	}
	
	include() {
		let $route = this.$route;
		console.log("changing DOM");
		$.each($(".view"), function(i,e){
			let $this = $(this);
			Request.load_file({
				url: Uri.get_base_url() + "app/views/" + $route.view,
				loaded: function(data) {
					$this.after("<!--View:" + i + "-->" + data + "<!--/View:" + i + "-->");
				}
			});
		});
		
		$.each($("include"), function(i,e){
			let $this = $(this);
			Request.load_file({
				url: Uri.get_base_url() + "app/" + $(this).attr("src"),
				loaded: function(data) {
					$this.replaceWith(data);
				}
			});
		});
	}
	
	exit() {
		console.log("Cleaning up DOM and exiting page");
		this.cleanup();
	}
	
	cleanup() {
		$("body").html($("body").html().replace(/(<!--view:\s*\d*\s*\-\->[\s\S]*?<!--\/view:\s*\d*\s*-->)/igm, ""));
	}
	
	eval(js) {
		return evalInContext(js, this.controller);
	}
	
	evalInContext(js, context) {
		//# Return the results of the in-line anonymous function we .call with the passed context
		return function() {
			return eval(js);
		}.call(context);
	}
}

/**
 * -----------------------------------------------------------------------------
 * This class runs our application it handles everything from checking
 * the current route to rendering the page.
 * -----------------------------------------------------------------------------
 * @class
 * @module Application
 * @public
 * @this Router
 * @author Jïn Muhjo
 */
class Router {
	constructor($rootScope) {
		this.$rootScope = $rootScope;
		this.routes = new RouteMap();
		this.current_route = null;
	}
	
	setRoutes(rarray) {
		let $this = this;
		$.each(rarray, function(i, e) {
			let route = new Route($this.$rootScope, e);
			if(!$this.routes.add(i, e.url, route)) {
				throw new Error("The route: " + i + "(" + e.url + ") already exists");
			}
		});
	}
	
	handle() {
		let action = Uri.get_action();
		console.log("Action is: " + action);
		let route = this.getRoute(action);
		console.log("Route is: " + route);
		if($_.nullOrUndef(route)) {
			console.log("Route success");
			if($_.nullOrUndef(this.current_route)) {
				this.current_route.exit();
			}
			route.run();
			this.current_route = route;
		}else{
			throw new Error("No route for action(" + action + ") found!");
		}
	}	
	
	getRoute(route) {
		let rte = this.routes.get(route);
		if(!$_.nullOrUndef(rte)) {			
			rte = this.routes.get("404");
			
			if(!$_.nullOrUndef(rte)) {
				throw new Error("No routes to go to!");
			}else{
				return rte;
			}
			
			throw new Error("The requested route " + route + " was not found in the route map. Goto 404 or Home.");
			return null;
		}else{
			return rte;
		}
	}
}

class View {
	contructor() {
		this.id = ++View.ID;
	}
}

View.ID = 0;

/**
 * -----------------------------------------------------------------------------
 * This class runs our application it handles everything from checking
 * the current route to rendering the page.
 * -----------------------------------------------------------------------------
 * @class
 * @module Application
 * @public
 * @this Route
 * @author Jïn Muhjo
 */
class Route {
	constructor($rootScope, route) {
		this.name = route.name;
		this.url = route.url;
		this.controller = route.controller;
		this.view = route.view;
		this.parent = route.parent;
		this.page = new Page($rootScope, this);
	}
	
	run() {
		console.log("Running route");
		this.page.run();
	}
	
	exit() {
		this.page.exit();
	}
}