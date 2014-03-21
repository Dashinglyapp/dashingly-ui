var url = require("url");

describe('login', function () {
	var ptor = protractor.getInstance();
	ptor.ignoreSynchronization = true;
	/**
	 * Function used to in place of `ptor.get` as the native version will not wait for manual bootstrapping.
	 * It adds an 0.5 sec wait before checking that url has been correctly set.
	 */
	function ptor_get(rel_path, pause_by) {
		ptor.driver.get(url.resolve(ptor.baseUrl, rel_path));
		ptor.wait(function () {
			if (pause_by) {
				waits(pause_by);
			}
			return ptor.driver.getCurrentUrl().then(function (in_url) {
				var re = new RegExp(rel_path, "i");
				return re.test(in_url);
			});
		}, 10000, "Taking too long to load " + rel_path);
	}

	describe("index", function () {
		it('basic tests', function () {
			expect(true).toBe(true);
		});
		it('should fail', function () {
			expect(true).toBe(false);
		});
		it('should have / in the url', function () {
			ptor_get('http://localhost:8000');
			expect(ptor.getCurrentUrl()).toContain('/');
			// expect($('#nav-home').getAttribute("class")).toBe("active");
		});

		// it("View on GitHub button should exists", function () {
		// 		expect($("#view-on-github").getAttribute('class')).toBe("btn btn-large");
		// });

		// it("View on GitHub button should exists", function () {
		// 		expect($("#view-on-github").getAttribute('class')).toBe("btn btn-large");
		// 		expect($("#view-on-github i").getAttribute('class')).toBe("icon-github-sign");
		// });
	});
});