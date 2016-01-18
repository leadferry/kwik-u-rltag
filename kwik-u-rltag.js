/**
 * LeadFerry Kwik-U-RLTag script v0.9.1
 * Contact us at support@leadferry.com if you are looking for assistance.
 * Interested in working for us? Reach out to us at N4IgpgtghglgNiAXCAVgewEYGcACcxQAmAZmAE5kCeAdAMZoQgA0IALjAA5IgDKYAdoQAEAVyxCoQuDH4BrIazQKAFjHEcoAczAqorCYULio/NK2XkFUDAqXmdAWTCEYIiAHoeaEWVo6sYLTsaPxCAO4w5gqR+EIA5AASOADCANIAzAAicRKCVprxylC0ss5xIAC+QA=
 */

var urltagApp = angular.module("urltagApp", []);

urltagApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(false).hashPrefix('!');
}]);

urltagApp.controller("URLTagCtrl", ['$scope', '$location', '$filter',
function ($scope, $location, $filter) {
	var urlParser = $("#urlParser")[0],
	initTags = {
		mode: "basic",
		campaign: '',
		medium: '',
		source: '',
		media: [
			{medium: "Social", tag: "social", enabled: true, sources: [
				{source: "Facebook", tag: "facebook", enabled: true},
				{source: "Twitter", tag: "twitter", enabled: true},
				{source: "LinkedIn", tag: "linkedin", enabled: true},
				{source: "Pinterest", tag: "pinterest", enabled: true},
				{source: "Google Plus", tag: "google-plus", enabled: true}
			]},
			{medium: "Email", tag: "email", enabled: true, sources: [
				{source: "Internal Newsletter", tag: "internal-newsletter", enabled: true},
				{source: "Vendor Newsletter", tag: "vendor-name", enabled: true}
			]},
			{medium: "Content Distribution", tag: "content-distribution", enabled: true, sources: [
				{source: "Outbrain", tag: "outbrain", enabled: true},
				{source: "Taboola", tag: "taboola", enabled: true},
				{source: "Gravity", tag: "gravity", enabled: true},
				{source: "Revcontent", tag: "revcontent", enabled: true}
			]},
			{medium: "Banner", tag: "banner", enabled: true, sources: [
				{source: "AdWords", tag: "adwords", enabled: true},
				{source: "Bing Ads", tag: "bing", enabled: true},
				{source: "Adroll", tag: "adroll", enabled: true},
				{source: "Perfect Audience", tag: "perfect-audience", enabled: true}
			]}
		],
		content: '',
		term: ''
	},
	initURLs = {rawURLs: [''], customTags: [{}]},
	initData = $location.path();
	
	//TODO: add semver to "initData" to improve merging in future versions
	if(initData.length > 1) {
		initData = JSON.parse(LZString.decompressFromEncodedURIComponent(initData.substring(1)));
		$scope.tags = angular.merge({}, initTags, initData.tags);
		$scope.urls = angular.merge({}, initURLs, initData.urls);
	} else {
		$scope.tags = angular.copy(initTags);
		$scope.urls = angular.copy(initURLs);
	}
	$scope.taggedURLs = {urls: [], selectAll: true, selectSome: false,
	headers: {
		"basic": ["URL"],
		"advanced": ["URL","Source","Medium","Term","Content","Campaign"]
	}, sort: {
		by: "campaign",
		descending: false
	}};
	
	$scope.resetAll = function(tags, urls) {
		var reset = (angular.isDefined(tags) || angular.isDefined(urls)) ? true : confirm("Are you sure you want to reset everything?");
		//TODO: if reset all, should hashbang be reset?
		if(reset) {
			$scope.resetTags();
			$scope.resetURLs();
		}
	};
	
	$scope.saveAll = function(tags, urls, title) {
		tags = angular.isDefined(tags) ? tags : $scope.tags;
		urls = angular.isDefined(urls) ? urls : $scope.urls;
		$location.path(LZString.compressToEncodedURIComponent(JSON.stringify({tags: tags, urls: urls})));
		$scope.modalSaveTitle = title || "Save All";
		$("#modalSave").modal('show');
	};
	
	$scope.bookmarkURL = function() {
		return $location.absUrl();
	};
	
	$scope.addBookmark = function() {
		//NOTE: Credits to https://gist.github.com/oilvier/70abd45d1f2ffc98b568
		if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox < 23
			window.sidebar.addPanel(document.title,window.location.href,'');
		} else if(window.sidebar && ! (window.sidebar instanceof Node)) { // Mozilla Firefox >= 23
			return true;
		} else if(window.external && ('AddFavorite' in window.external)) { // Internet Explorer
			window.external.AddFavorite(location.href,document.title);
		} else if(window.opera && window.print) { // Opera < 15
			return true;
		} else { // WebKit - Safari/Chrome
			alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
		}
		return false;
	};
	
	$scope.copyBookmark = function() {
		$("#modalSaveURL").select();
		document.execCommand("copy");
	};
	
	$scope.toggleAllMediumSource = function(toggle) {
		angular.forEach($scope.tags.media, function(medium) {
			medium.enabled = toggle;
			angular.forEach(medium.sources, function(source) {
				source.enabled = toggle;
			});
		});
	};
	
	$scope.resetTags = function() {
		angular.merge($scope.tags, initTags, {mode: $scope.tags.mode});
	};
	
	$scope.saveTags = function() {
		$scope.saveAll($scope.tags, {}, "Save Tags");
	};
	
	$scope.addURL = function() {
		$scope.urls.rawURLs.push('');
		$scope.urls.customTags.push({});
	};
	
	$scope.removeURL = function($index) {
		$scope.urls.rawURLs.splice($index, 1);
		$scope.urls.customTags.splice($index, 1);
	};
	
	$scope.addContentTerm = function($index) {
		for(i=$scope.urls.customTags.length; i <= $index; i++) {
			$scope.urls.customTags.push({});
		}
		var tags = $scope.urls.customTags[$index];
		if(!tags.content && !tags.term) {
			tags.content = "custom";
			tags.term = "custom";
		}
	};
	
	$scope.removeContentTerm = function($index) {
		var tags = $scope.urls.customTags[$index];
		if(angular.isDefined(tags)) {
			tags.content = null;
			tags.term = null;
		}
	};
	
	$scope.saveURLs = function() {
		$scope.saveAll({}, $scope.urls, "Save URLs");
	};
	
	$scope.resetURLs = function() {
		$scope.urls = angular.copy(initURLs);
	};
	
	$scope.tagURLs = function(tags, urls, customTags) {
		var taggedURLs = [];
		if(tags.mode == "basic") {
			angular.forEach(urls, function(url) { if(url) {
				taggedURLs.push($scope.tagURL({url:url}, {medium:"",tag:tags.medium}, {tag:tags.source}));
			}});
		} else {
			angular.forEach(urls, function(url, index) { if(url) {
				if(tags.medium || tags.source) {
					taggedURLs.push($scope.tagURL(angular.merge({url:url}, customTags[index]), {medium:"",tag:tags.medium}, {tag:tags.source}));
				}
				angular.forEach(tags.media, function(medium) { if(medium.enabled && medium.tag) {
					angular.forEach(medium.sources, function(source) { if(source.enabled && source.tag) {
						taggedURLs.push($scope.tagURL(angular.merge({url:url}, customTags[index]), medium, source));
					}})
				}})
			}});
		}
		return taggedURLs;
	};
	
	$scope.tagURL = function(url, medium, source) {
		var tags = ["source","medium","term","content","campaign"], params = [], param, value, ret = {};
		angular.forEach(tags, function(tag, index) {
			param = "utm_"+tag+"=";
			value = null;
			if(tag=="medium") {
				value = url[medium.medium] || medium.tag;
			} else if(tag=="source") {
				value = url[medium.medium] ? (url[medium.medium][source.source] || source.tag) : source.tag;
			} else {
				value = url[tag] || $scope.tags[tag];
			}
			if(value) {
				params.push(param+value);
				ret[tag] = value;
			}
		});
		urlParser.href = url.url;
		if(urlParser.search) {
			urlParser.search += '&' + params.join('&');
		} else {
			urlParser.search = params.join('&');
		}
		ret["url"] = urlParser.href;
		ret["copy"] = $scope.taggedURLs.selectAll;
		return ret;
	};
	
	$scope.$watch("tags", function(newVal, oldVal) {
		$scope.taggedURLs.urls = $scope.tagURLs($scope.tags, $scope.urls.rawURLs, $scope.urls.customTags);
	}, true);
	
	$scope.$watch("urls", function(newVal, oldVal) {
		$scope.taggedURLs.urls = $scope.tagURLs($scope.tags, $scope.urls.rawURLs, $scope.urls.customTags);
	}, true);
	
	$scope.sortOrder = function(sortByIndex) {
		var sortBy = $filter("lowercase")($scope.taggedURLs.headers[$scope.tags.mode][sortByIndex]);
		if($scope.taggedURLs.sort.by == sortBy) {
			$scope.taggedURLs.sort.descending = !$scope.taggedURLs.sort.descending;
		} else {
			$scope.taggedURLs.sort.by = sortBy;
		}
	};
	
	$scope.selectAllToggle = function() {
		angular.forEach($scope.taggedURLs.urls, function(taggedURL) {
			taggedURL.copy = $scope.taggedURLs.selectAll;
		});
	};
	
	$scope.$watch("taggedURLs.urls", function(newVal, oldVal) {
		var selected=0, unselected=0;
		angular.forEach(newVal, function(taggedURL) {
			if(taggedURL.copy==true) {
				selected++;
			} else {
				unselected++;
			}
		});
		if(selected > 0 && unselected > 0) {
			$scope.taggedURLs.selectSome = true;
		} else {
			if(selected == newVal.length) {
				$scope.taggedURLs.selectAll = true;
			} else if(unselected == newVal.length) {
				$scope.taggedURLs.selectAll = false;
			}
			$scope.taggedURLs.selectSome = false;
		}
	}, true);
	
	$scope.copy = function(index) {
		var text = '', nURLs = 0;
		if(!angular.isDefined(index)) {
			var urls = $filter("orderBy")($scope.taggedURLs.urls, $scope.taggedURLs.sort.by, $scope.taggedURLs.sort.descending);
			angular.forEach(urls, function(taggedURL) {
				if(taggedURL.copy) {
					text += taggedURL["url"] + '\n';
					nURLs++;
				}
			})
		} else {
			text = $scope.taggedURLs.urls[index]["url"];
		}
		var copyPad = $("<textarea>");
		$("body").append(copyPad);
		copyPad.val(text).select();
		var copySuccess = document.execCommand("copy");
		copyPad.remove();
		var tooltipAlert = $("#buttonCopy + .popover");
		tooltipAlert.toggleClass("alert-success", copySuccess);
		tooltipAlert.toggleClass("alert-danger", !copySuccess);
		tooltipAlert.find(".popover-content").text(copySuccess ? nURLs + " URL(s) copied to clipboard" : "Failed to copy URL(s) to clipboard");
		tooltipAlert.fadeIn(function() { $(this).delay(copySuccess ? 1000 : 2000).fadeOut(); });
		return copySuccess;
	};
}]);

urltagApp.directive('ngIndeterminate', function($compile) {
	return {
		restrict: 'A',
		link: function(scope, element, attributes) {
			scope.$watch(attributes['ngIndeterminate'], function (value) {
				element.prop('indeterminate', !!value);
			});
		}
	};
});
