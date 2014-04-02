/* globals: waits protractor expect it describe browser */
// var browser = require('selenium-browser');

var url = require("url");
var flow = browser.driver.controlFlow();

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


	/**
	 * Function used to in place of `ptor.get` as the native version will not wait for manual bootstrapping.
	 * It adds an 0.5 sec wait before checking that url has been correctly set.
	 */
	function ptor_get(rel_path, pause_milliseconds,fn) {
		return flow.execute(function(){
			return browser.driver.get(rel_path).then(function (ur) {
				return protractor.promise.delayed(pause_milliseconds || 0);
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
		}
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

		it('should be on index', function () {
			expect(browser.driver.getCurrentUrl()).toMatch(/\/app\/index\/default/i)
		});

		it('should have a login & signup links', function () {
			expect(browser.driver.getCurrentUrl()).toMatch(/\/app\/index\/default/)
			el('linkText,Log In,isVis');
			el('linkText,Sign Up,isVis');
		});

		it('should navigate to signup widget on signup link click', function () {
			el('linkText,Log In,click');
			ptor.sleep(1000);
			el('css,.btn-login,isVis');
		});

		it('should log in after filling out the login form', function () {
			el('css,input[type=email],clear');
			el('css,input[type=password],clear');
			ptor.sleep(1000);
			el('css,input[type=email],sendKeys,test'+ Date.now() +'@realize.pe');
			el('css,input[type=password],sendKeys,testtest');
			ptor.sleep(1000);
			el('buttonText,Sign Up,click');
			ptor.sleep(10000);
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