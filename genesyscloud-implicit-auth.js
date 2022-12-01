'use strict';

var accessToken;
var urlParameters = {};

if (window.location.hash) {
	accessToken = getParameterByName('access_token');
	
	const state = getParameterByName('state');
	retrieveUrlParameters(state);
} else {
	let clientId = getParameterByName('clientId');
	if (clientId.length === 0) {
		clientId = 'ec8d20f0-a7d3-481a-9512-5ec77db14554';
	}
	console.log(clientId);
	const queryStringData = {
		response_type: 'token',
		client_id: clientId,
		redirect_uri: [window.location.protocol, '//', window.location.host, window.location.pathname].join(''),
		state: window.location.search
	};
	const queryStringElements = Object.keys(queryStringData).map(key =>
		encodeURIComponent(key) + '=' + encodeURIComponent(queryStringData[key]));
	const queryString = queryStringElements.join('&');
	window.location.replace('https://login.mypurecloud.com/oauth/authorize?' + queryString);
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	const regex = new RegExp('[\\#&]' + name + '=([^&#]*)');
	const results = regex.exec(location.hash);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function retrieveUrlParameters(state) {
	if (state === undefined || state.length === 0) {
		return;
	}
	decodeURIComponent(state).replace('?', '').split('&').forEach(val => {
		const parameter = val.split('=', 2);
		urlParameters[parameter[0]] = parameter[1] === undefined ? true : decodeURIComponent(parameter[1]);
	});
}