/**
 * LeadFerry Kwik-U-RLTag script v0.7.0
 * Contact us at support@leadferry.com if you are looking for assistance.
 * Interested in working for us? Reach out to us at N4IgpgtghglgNiAXCAVgewEYGcACcxQAmAZmAE5kCeAdAMZoQgA0IALjAA5IgDKYAdoQAEAVyxCoQuDH4BrIazQKAFjHEcoAczAqorCYULio/NK2XkFUDAqXmdAWTCEYIiAHoeaEWVo6sYLTsaPxCAO4w5gqR+EIA5AASOADCANIAzAAicRKCVprxylC0ss5xIAC+QA=
 */

var urltagApp = angular.module("urltagApp", []);

urltagApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(false).hashPrefix('!');
}]);

urltagApp.controller("URLTagCtrl", ['$scope', '$location', '$filter', function ($scope, $location, $filter) {
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
			]},
			{medium: "Email", tag: "email", enabled: true, sources: [
				{source: "MailChimp", tag: "mailchimp", enabled: true},
				{source: "MailGun", tag: "mailgun", enabled: true}
			]},
			{medium: "Content Marketing", tag: "content_mktg", enabled: true, sources: [
				{source: "Outbrain", tag: "outbrain", enabled: true},
				{source: "Taboola", tag: "taboola", enabled: true}
			]},
			{medium: "Custom", tag: "custom_medium", enabled: false, sources: [
				{source: "Custom", tag: "custom_source", enabled: true}
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
	$scope.taggedURLs = {urls: [], headers: {
		"basic": ["URL"],
		"advanced": ["URL","Campaign","Medium","Source","Content","Term"]
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
	
	$scope.saveAll = function(tags, urls) {
		tags = angular.isDefined(tags) ? tags : $scope.tags;
		urls = angular.isDefined(urls) ? urls : $scope.urls;
		$location.path(LZString.compressToEncodedURIComponent(JSON.stringify({tags: tags, urls: urls})));
	};
	
	$scope.toggleAllMediumSource = function(toggle) {
		angular.forEach($scope.tags.media, function(medium) {
			if(medium.medium !== "Custom") {
				medium.enabled = toggle;
				angular.forEach(medium.sources, function(source) {
					source.enabled = toggle;
				})
			}
		});
	};
	
	$scope.resetTags = function() {
		angular.merge($scope.tags, initTags, {mode: $scope.tags.mode});
	};
	
	$scope.saveTags = function() {
		$scope.saveAll($scope.tags, {});
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
		$scope.saveAll({}, $scope.urls);
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
		var tags = ["campaign","medium","source","content","term"], params = [], param, value, ret = {};
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
}]);

