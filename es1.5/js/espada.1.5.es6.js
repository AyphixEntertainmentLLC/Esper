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
		$.each(this.map, function(i, e) {
			if ($_.nullOrUndef(e.keys[key])) {
				return this.map[i];
			}
		});
		return undefined;
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
			success: function (html) {
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
		
		var success = function() { throw Error("Request returned a success but no success callback was set."); };		
		var fail    = function() { throw Error("Request returned a failure but no success callback was set."); };
		var error   = function() { throw Error("Request returned an error but no error callback was set.");    };
		
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
					error("");
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
			$this.router.handle();
		});
	}
	
	setRoutes(routes) {
		this.router.setRoutes(routes);
	}
	
	run(rootScope) {
		rootScope(this.$rootScope);
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
	constructor($rootScope) {
		this.controller = new Controller($rootScope);
	}
	
	title(title) {
		$("title").text(title);
	}
	
	$apply(func) {
		//this.eval();
		if ($_.nullOrUndef(func)) {
			func();
		}
		this.include();
	}
	
	include() {
		$.each($("include"), function(i,e){
			console.log($(this).attr("src"));
		});
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
	}
	
	setRoutes(rarray) {
		let $this = this;
		$.each(rarray, function(i, e) {
			let route = new Route($this.$rootScope);
			if(!$this.routes.add(i, e.url, route)) {
				throw Error("The route: " + i + "(" + e.url + ") already exists");
			}
		});
	}
	
	
	
	getRoute(route) {
		let rte = this.routes.get(route);
		if($_.nullOrUndef(rte)) {
			
			rte = this.routes.get("404");
			
			if($_.nullOrUndef(rte)) {
				rte = this.routes.get("/");
				if($_.nullOrUndef(rte)) {
					throw Error("No routes to go to!");
				}else{
					return rte;
				}
			}else{
				return rte;
			}
			
			debug.log("The requested route " + route + " was not found in the route map. Goto 404 or Home.");
		}else{
			return rte;
		}
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
 * @this Route
 * @author Jïn Muhjo
 */
class Route {
	constructor($rootScope, name, url) {
		this.page = new Page($rootScope, this);
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
		url = url.replace(/((\w)*(\.((html|htm)|php|css|js|less|scss|xhtml|rb|py|jsp)).*)/g, "");
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