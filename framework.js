const conversationId = urlParameters['conversationId'];
const agentParticipantId = urlParameters['agentParticipantId'];

fetch(`https://apps.mypurecloud.com/platform/api/v2/conversations/${conversationId}/participants/${agentParticipantId}`, {
	method: 'PATCH',
	body: JSON.stringify({
		state: 'connected',
	}),
	headers: {
		'Authorization': `Bearer ${accessToken}`,
		'Content-type': 'application/json; charset=UTF-8'
	},
})
	.then(response => response.json())
	.then(json => console.log(json));