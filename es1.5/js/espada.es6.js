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
				constructor($rootScope) {
								this.page = new Page($rootScope);
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

								if (url == "") {
												url = "/";
								}

								return url;
				}
}