/* globals: waits protractor expect it describe browser */
// var browser = require('selenium-browser');

var url = require("url");
var flow = browser.driver.controlFlow();
var getFakeDriver = function() {

	return {
		controlFlow: function() {
			return flow;
		},
		sleep: function(ms) {
			return flow.timeout(ms);
		},
		setUp: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled('setup done');
			});
		},
		getValueA: function() {
			return flow.execute(function() {
				return protractor.promise.delayed(500).then(function() {
					return protractor.promise.fulfilled('a');
				});
			});
		},
		getOtherValueA: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled('a');
			});
		},
		getValueB: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled('b');
			});
		},
		getBigNumber: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled(1111);
			});
		},
		getDecimalNumber: function() {
				return flow.execute(function() {
					return protractor.promise.fulfilled(3.14159);
				});
			},
		getDisplayedElement: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled({
					isDisplayed: function() {
						return protractor.promise.fulfilled(true);
					}
				});
			});
		},
		getHiddenElement: function() {
			return flow.execute(function() {
				return protractor.promise.fulfilled({
					isDisplayed: function() {
						return protractor.promise.fulfilled(false);
					}
				});
			});
		},

	};
};
var fakeDriver = getFakeDriver();

describe('Login/Registration/Logout', function () {
	var ptor = protractor.getInstance();
	ptor.ignoreSynchronization = true;
	// beforeEach(function() {
	// 	// 'this' should work properly to add matchers.
	// 	this.addMatchers({
	// 		toBeLotsMoreThan: function(expected) {
	// 			return this.actual > expected + 100;
	// 		},
	// 		// Example custom matcher returning a promise that resolves to true/false.
	// 		toBeDisplayed: function() {
	// 			return this.actual.isDisplayed();
	// 		}
	// 	});
	// });


// WORKING
// protractor.promise.fulfilled(element(by.className('register-link')).isDisplayed())
// protractor.promise.fulfilled(element(by.linkText('Register')).isDisplayed())

	var visible = {
		linkText:function (text) {
			return protractor.promise.fulfilled(element(by.linkText(text)).isDisplayed())
		},
		className:function (className) {
			return protractor.promise.fulfilled(element(by.className(className)).isDisplayed())
		}
	}
	function linkTextExists(text){
		return function(){
			return expect(element(by.linkText(text)).isPresent()).toBe(true);
		}
	}
	function linkTextVisible(text){
		return function(){
			return expect(element(by.linkText(text)).isDisplayed()).toBe(true);
		}
	}
	var on = {
		home:function (fn) {
			return ptor_get('http://localhost:8000',10000).then(fn);
		}
	};

	/**
	 * Function used to in place of `ptor.get` as the native version will not wait for manual bootstrapping.
	 * It adds an 0.5 sec wait before checking that url has been correctly set.
	 */
	function ptor_get(rel_path, pause_milliseconds,fn) {
		return flow.execute(function(){
			return browser.driver.get(rel_path).then(function (ur) {
				return protractor.promise.delayed(pause_milliseconds || 0);
				// .then(function () {
				// 	// browser.debugger();
				// 	// return visible.linkText('Register');
				// 	// return browser.driver.getCurrentUrl().then(function (in_url) {
				// 	// 	return protractor.promise.fulfilled(fn());
				// 	// 	// return (new RegExp(rel_path, "i")).test(ur) ?
				// 	// 	// 	protractor.promise.fulfilled(true) :
				// 	// 	// 	protractor.promise.rejected(false);
				// 	// });
				// });
			});
		});
	}


	var actions = {
		isVis:function (elem) {
			expect(elem.isDisplayed()).toBe(true);
		},
		exists:function (elem) {
			expect(elem.isPresent()).toBe(true);
		},
		click:function (elem) {
			elem.click();
		},
		sendKeys:function (elem,arg) {
			elem.sendKeys.call(elem,arg);
		},
		clear:function (elem,arg) {
			elem.clear();
		},
	}

	var getting = ptor_get('http://localhost:8000',5000);
	function el(argStr){
		return getting.then(function () {
			// flow.execute
			var argArr = argStr.split(',');
			var type = argArr[0];
			var txt = argArr[1];
			var actionName = argArr[2];
			var actionArgs = argArr[3];

			// types are buttonText, className, css, linkText, model, input, selectedOption, binding
			// actions are isDisplayed, isPresent
			var elem = element(by[type](txt));
			return actionName && actions[actionName] ? actions[actionName](elem,actionArgs) : elem;
		});
	}

	describe("First visit", function () {

		it('should pass a basic test', function () {
			expect(true).toBe(true);
		});

		it('should have a login & register links', function () {
			el('linkText,Login,isVis');
			el('linkText,Register,isVis');
		});

		it('should navigate to login widget on login link click', function () {
			el('linkText,Login,isVis');
			el('linkText,Login,click');
			ptor.sleep(1000);
			el('css,.btn-login,isVis');
		});

		it('should log in after filling out the login form', function () {
			el('css,input[type=email],clear');
			el('css,input[type=password],clear');
			ptor.sleep(1000);
			el('css,input[type=email],sendKeys,test@realize.pe');
			el('css,input[type=password],sendKeys,testtest');
			ptor.sleep(1000);
			el('buttonText,Login,click');
			ptor.sleep(99000);
		});
				// expect($$('a:contains("Falaffel"):visible').count()).toBe(0);
				// expect(element(by.linkText('Register')).isDisplayed()).toBe(true);
				// expect(visible.linkText('Register')).toBe(true);
				// expectLinkTextVisible('Register');
				// expectLinkTextVisible('Login').click();
				// expectCssVisible('.panel');

				// ptor_get('http://localhost:8000',10000,function(){
				// 	// return !!ptor.$('a:contains("Login"):visible').length;
				// 	return visible.linkText('Register');
				// })).toBe(true);
				// browser.debugger();
				// on.home(linkTextVisible('Register'));
				// expect($('#nav-home').getAttribute("class")).toBe("active");
		// });
		// it('should have a register link', function () {
		// 	expect(element(by.css('a:contains("Falaffel"):visible'))).toBe(true);
		// 	// expect($('#nav-home').getAttribute("class")).toBe("active");
		// });
		// it('should display the correct title load the moreinfo page by default', function () {
		// 	ptor_get('http://localhost:8000');
		// 	expect(browser.getCurrentUrl()).toContain('/');
		// 	expect(ptor.getCurrentUrl()).toContain('/');
		// 	var ele = by.id('home');
	// 		expect(ptor.isElementPresent(ele)).toBe(true);
		// 	// expect($('#nav-home').getAttribute("class")).toBe("active");
		// });

		// it("View on GitHub button should exists", function () {
		// 		expect($("#view-on-github").getAttribute('class')).toBe("btn btn-large");
		// });

		// it("View on GitHub button should exists", function () {
		// 		expect($("#view-on-github").getAttribute('class')).toBe("btn btn-large");
		// 		expect($("#view-on-github i").getAttribute('class')).toBe("icon-github-sign");
		// });
	});
});