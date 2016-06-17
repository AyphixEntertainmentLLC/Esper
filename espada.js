"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controller = function Controller(page) {
  _classCallCheck(this, Controller);

  this.route = page.route;
  this.app = page.app;
};

var Page = function () {
  function Page(route, app) {
    _classCallCheck(this, Page);

    this.base_content = null;
    this.content = null;
    this.controller = null;
    this.route = route;
    this.app = app;
    console.log("Created page");
  }

  Page.prototype.start = function start() {
    var _this = this;

    if (this.route != null && this.route != undefined) {
      $.ajax(Uri.get_base_url() + "/" + this.app.path + "/" + this.route.view).done(function (html) {
        console.log("page html load success");
        _this.base_content = html;
        _this.parse_page();
      }).fail(function (xhr, code, message) {
        console.log(message);
      });
    } else {
      throw "Malformatted route! Page::start()";
    }
  };

  Page.prototype.parse_page = function parse_page() {
    var reps = /\{\{(.*?)\}\}/g;
    if (this.base_content != null || this.base_content != "") {
      console.log("Parsing replaces");
      this.content = this.base_content.replace(reps, "<span id='es-val-$1'></span>");
      this.render_page();
    }
  };

  Page.prototype.render_page = function render_page() {
    if (this.content != null) {
      this.controller = new Controller(this);
      if (this.route.controller != null && this.route.controller != null) {
        this.route.controller(this.controller);
      }
      console.log("Setting page html");
      $("view").html(this.content);
    } else {
      throw "Content was null Page::render_page()";
    }
  };

  return Page;
}();

var Router = function () {
  function Router(app) {
    _classCallCheck(this, Router);

    this.states = [];
    this.app = app;
    this.page = null;
  }

  Router.prototype.set_routes = function set_routes(routes) {
    if (!$.isArray(routes)) {
      throw "route was not an array Router::set_routes()";
      return;
    }
    var app_states = this.states;
    $.each(routes, function (index, route) {
      if (route.url != undefined) {
        app_states[route.url] = route;
      } else {
        throw "Route.url was not defined Router::set_routes()";
      }
    });
    console.log("Set routes");
  };

  Router.prototype.do_route = function do_route() {
    var route = this.get_route(Uri.get_path());
    if (route != null && route != undefined) {
      console.log("This was a valid route");
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
  };

  Router.prototype.load_route = function load_route(route) {
    if (route.view != undefined) {
      console.log("creating page");
      this.page = new Page(route, this.app);
      this.route_start(this.page);
    } else {
      throw "Route undefined Router::load_route(route)";
    }
  };

  Router.prototype.route_start = function route_start(page) {
    if (page != null && page != undefined) {
      console.log("Starting page");
      page.start();
    } else {
      throw "Passed page was null Router::route_start()";
    }
  };

  Router.prototype.get_route = function get_route(url) {
    if (this.states[url] != undefined) {
      return this.states[url];
    } else {
      return null;
    }
  };

  return Router;
}();

var Uri = function () {
  function Uri() {
    _classCallCheck(this, Uri);
  }

  Uri.get_current_url = function get_current_url() {
    var uri = window.location.href.replace("index.html", "");
    return uri;
  };

  Uri.get_base_url = function get_base_url() {
    var uri = Uri.get_current_url();
    if (uri.substring(uri.length - 1) == "/") {
      uri = uri.substring(0, uri.length - 1);
    }
    var index = uri.indexOf("#");
    if (index > -1) {
      return uri.substring(0, uri.indexOf("#"));
    } else {
      return uri;
    }
  };

  Uri.get_path = function get_path() {
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
  };

  return Uri;
}();

var Application = function () {
  function Application(name, app_path) {
    var _this2 = this;

    _classCallCheck(this, Application);

    this.name = name;
    this.path = app_path;

    this.routes = new Router(this);

    $(window).on('hashchange', function () {
      _this2.routes.do_route();
    });
  }

  Application.prototype.run = function run(routes) {
    this.routes.set_routes(routes);
    this.routes.do_route();
  };

  return Application;
}();