/**
 * LeadFerry Kwik-U-RLTag script v0.3.1
 * Contact us at support@leadferry.com if you are looking for assistance.
 * Interested in working for us? Reach out to us at N4IgpgtghglgNiAXCAVgewEYGcACcxQAmAZmAE5kCeAdAMZoQgA0IALjAA5IgDKYAdoQAEAVyxCoQuDH4BrIazQKAFjHEcoAczAqorCYULio/NK2XkFUDAqXmdAWTCEYIiAHoeaEWVo6sYLTsaPxCAO4w5gqR+EIA5AASOADCANIAzAAicRKCVprxylC0ss5xIAC+QA=
 */

var urltagApp = angular.module("urltagApp", []);

urltagApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(false).hashPrefix('!');
}]);

urltagApp.controller("URLTagCtrl", ['$scope', '$location', function ($scope, $location) {
	var urlParser = $("#urlParser")[0], defaultTags = {
		campaign: '',
		media: [
			{medium: "Social", tag: "social", sources: [
				{source: "Facebook", tag: "facebook"},
				{source: "Twitter", tag: "twitter"},
				{source: "LinkedIn", tag: "linkedin"},
				{source: "Pinterest", tag: "pinterest"},
			]},
			{medium: "Email", tag: "email", sources: [
				{source: "MailChimp", tag: "mailchimp"},
				{source: "MailGun", tag: "mailgun"}
			]},
			{medium: "Content Marketing", tag: "content_mktg", sources: [
				{source: "Outbrain", tag: "outbrain"},
				{source: "Taboola", tag: "taboola"}
			]},
			{medium: "Custom", tag: "custom_medium", sources: [
				{source: "Custom", tag: "custom_source"}
			]}
		],
		content: '',
		term: ''
	}, initTags = $location.path();
	$scope.tags = (initTags.length > 1) ? JSON.parse(LZString.decompressFromEncodedURIComponent(initTags.substring(1))) : angular.copy(defaultTags);
	$scope.urls = [{url:''}];
	
	$scope.updateHashbang = function() {
		$location.path(LZString.compressToEncodedURIComponent(JSON.stringify($scope.tags)));
	};
	
	$scope.resetHashbang = function() {
		$location.path('');
	};
	
	$scope.addUrl = function() {
		$scope.urls.push({url:''});
	};
	
	$scope.removeUrl = function($index) {
		$scope.urls.splice($index, 1);
	};
	
	$scope.tagUrl = function(url, medium, source) {
		if(!url.url)	return '';
		tags = [];
		if($scope.tags.campaign) {
			tags.push("utm_campaign="+$scope.tags.campaign);
		}
		tags.push("utm_medium="+medium.tag);
		tags.push("utm_source="+source.tag);
		if(url.content) {
			tags.push("utm_content="+url.content);
		} else if($scope.tags.content) {
			tags.push("utm_content="+$scope.tags.content);
		}
		if(url.term) {
			tags.push("utm_term="+url.term);
		} else if($scope.tags.term) {
			tags.push("utm_term="+$scope.tags.term);
		}
		urlParser.href = url.url;
		if(urlParser.search) {
			urlParser.search += '&' + tags.join('&');
		} else {
			urlParser.search = tags.join('&');
		}
		return urlParser.href;
	};
	
	$scope.addContentTerm = function($index) {
		var url = $scope.urls[$index];
		if(!url.content && !url.term) {
			url.content = "custom";
			url.term = "custom";
		}
	};
	
	$scope.removeContentTerm = function($index) {
		var url = $scope.urls[$index];
		url.content = null;
		url.term = null;
	};
}]);

