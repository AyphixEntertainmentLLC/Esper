class Controller {
  constructor(page) {
    this.route = page.route;
    this.app  = page.app;
  }
}

class Page {
  constructor(route, app) {
    this.base_content = null;
    this.content = null;
    this.controller = null;
    this.route = route;
    this.app = app;
    console.log("Created page");
  }
  
  start() {
    if(this.route != null && this.route != undefined) {
      $.ajax(Uri.get_base_url() + "/" + this.app.path + "/" + this.route.view)
    	.done((html) => {
    	  console.log("page html load success");
    	  this.base_content = html;
    	  this.parse_page();
    	}).fail(function(xhr, code, message) {
    	  console.log(message);
    	});
    }else{
      throw "Malformatted route! Page::start()";
    }
  }
  
  parse_page() {
    var reps = /\{\{(.*?)\}\}/g
    if(this.base_content != null || this.base_content != "") {
      console.log("Parsing replaces");
      this.content = this.base_content.replace(reps, "<span id='es-val-$1'></span>")
      this.render_page();
    }
  }
  
  render_page() {
    if(this.content != null) {
      this.controller = new Controller(this);
      if(this.route.controller != null && this.route.controller != null) {
        this.route.controller(this.controller);
      }
      console.log("Setting page html");
      $( "view" ).html(this.content);
    }else {
      throw "Content was null Page::render_page()"
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
    $.each(routes, function (index,route) {
      if(route.url != undefined) {
        app_states[route.url] = route;
      }else {
        throw "Route.url was not defined Router::set_routes()"
      }
    });
    console.log("Set routes");
  }
  
  do_route() {
    var route = this.get_route(Uri.get_path());
    if(route != null && route != undefined) {
      console.log("This was a valid route");
      this.load_route(route);
    } else{
      route = this.get_route("/");
      if(route != null && route != undefined) {
        console.log("invalid route loading root");
        this.load_route(route);
      }else {
        throw "No route found exiting Router::do_route()";
      }
    }
  }
  
  load_route(route) {
    if(route.view != undefined) {
      console.log("creating page");
      this.page = new Page(route, this.app);
      this.route_start(this.page);
    }else{
      throw "Route undefined Router::load_route(route)";
    }
  }
  
  route_start(page) {
    if(page != null && page != undefined) {
      console.log("Starting page");
      page.start();
    }else {
      throw "Passed page was null Router::route_start()";
    }
  }
  
  get_route(url) {
  	if(this.states[url] != undefined) {
    	return this.states[url];
   	}else{
   		return null;
   	}
  }
}

class Uri {
  static get_current_url() {
    var uri = window.location.href.replace("index.html", "");
    return uri;
  }

  static get_base_url() {
    var uri = Uri.get_current_url();
    if(uri.substring(uri.length -1) == "/") {
      uri = uri.substring(0, uri.length - 1);
    }
    var index = uri.indexOf("#");
    if(index > -1) {
      return uri.substring(0, uri.indexOf("#"));
    }else{
      return uri;
    }
  }
  
  static get_path() {
    var uri = Uri.get_current_url();
    var index = uri.indexOf("#");
    if(index > -1) {
      uri = uri.substring(index);
    }else{
    	uri = uri.replace(Uri.get_current_url(), "");
    }
    if(uri.substring(0, 1) == "#") {
      uri = uri.substring(1, uri.length);
    }
    
    if(uri == "" || uri == undefined || uri == null) {
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
    
    $(window).on('hashchange', () => { this.routes.do_route();});
  }
  
  run(routes) {
    this.routes.set_routes(routes);
    this.routes.do_route();
  }
}