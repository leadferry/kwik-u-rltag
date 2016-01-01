/**
 * LeadFerry Kwik-U-RLTag script v0.4.0
 * Contact us at support@leadferry.com if you are looking for assistance.
 * Interested in working for us? Reach out to us at N4IgpgtghglgNiAXCAVgewEYGcACcxQAmAZmAE5kCeAdAMZoQgA0IALjAA5IgDKYAdoQAEAVyxCoQuDH4BrIazQKAFjHEcoAczAqorCYULio/NK2XkFUDAqXmdAWTCEYIiAHoeaEWVo6sYLTsaPxCAO4w5gqR+EIA5AASOADCANIAzAAicRKCVprxylC0ss5xIAC+QA=
 */

var urltagApp = angular.module("urltagApp", []);

urltagApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(false).hashPrefix('!');
}]);

urltagApp.controller("URLTagCtrl", ['$scope', '$location', '$filter', function ($scope, $location, $filter) {
	var urlParser = $("#urlParser")[0], defaultTags = {
		campaign: '',
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
	}, initTags = $location.path();
	$scope.tags = (initTags.length > 1) ? JSON.parse(LZString.decompressFromEncodedURIComponent(initTags.substring(1))) : angular.copy(defaultTags);
	$scope.urls = [{url:''}];
	$scope.taggedURLs = [];
	$scope.headers = ["URL","Campaign","Medium","Source","Content","Term"];
	$scope.sortBy = "url";
	$scope.sortDesc = false;
	
	$scope.updateHashbang = function(newVal, oldVal) {
		$location.path(LZString.compressToEncodedURIComponent(JSON.stringify(newVal || $scope.tags)));
	};
	
	$scope.resetHashbang = function() {
		$scope.tags = angular.copy(defaultTags);
	};
	
	$scope.$watch("tags", $scope.updateHashbang, true);
	
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
	
	$scope.addURL = function() {
		$scope.urls.push({url:''});
	};
	
	$scope.removeURL = function($index) {
		$scope.urls.splice($index, 1);
	};
	
	$scope.resetURLs = function() {
		$scope.urls = [{url:''}];
	};
	
	$scope.tagURLs = function(tags, urls) {
		var taggedURLs = [];
		angular.forEach(urls, function(url) { if(url.url) {
			angular.forEach(tags.media, function(medium) { if(medium.enabled) {
				angular.forEach(medium.sources, function(source) { if(source.enabled) {
					taggedURLs.push($scope.tagURL(url, medium, source));
				}})
			}})
		}});
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
		$scope.taggedURLs = $scope.tagURLs($scope.tags, $scope.urls);
	}, true);
	
	$scope.$watch("urls", function(newVal, oldVal) {
		$scope.taggedURLs = $scope.tagURLs($scope.tags, $scope.urls);
	}, true);
	
	$scope.sortOrder = function(sortByIndex) {
		var sortBy = $filter("lowercase")($scope.headers[sortByIndex]);
		if($scope.sortBy == sortBy) {
			$scope.sortDesc = !$scope.sortDesc;
		} else {
			$scope.sortBy = sortBy;
		}
	};
}]);

