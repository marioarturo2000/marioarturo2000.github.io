const { agentParticipantId } = window.urlParameters;
const { conversationId } = window.urlParameters;

let channelId;

console.log('agentParticipantId', agentParticipantId);
console.log('conversationId', conversationId);

const endPreview = () => {
  console.log('endPreview()');
  fetch(`https://api.mypurecloud.com/api/v2/conversations/${conversationId}/participants/${agentParticipantId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      state: 'disconnected',
    }),
    headers: {
      Authorization: `Bearer ${window.accessToken}`,
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
};

const getConversation = () => {
  console.log('getConversation()');
  return fetch(`https://api.mypurecloud.com/api/v2/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${window.accessToken}`,
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return json;
    });
};

const handleWebSocketOpen = () => {
  console.log('handleWebSocketOpen()');
  fetch(`https://api.mypurecloud.com/api/v2/notifications/channels/${channelId}/subscriptions`, {
    method: 'PUT',
    body: JSON.stringify([
      `v2.detail.events.conversation.${conversationId}.acw`,
    ]),
    headers: {
      Authorization: `Bearer ${window.accessToken}`,
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
};

const handleWebSocketMessage = (event) => {
  console.log('handleWebSocketMessage()');
  const data = JSON.parse(event.data);
  console.log('data', data);
  if (data.topicName.indexOf('acw') !== -1) {
    getConversation()
      .then((conversation) => {
        const agentParticipant = conversation.participants.find((participant) => participant.purpose === 'agent');
        const agentParticipantCallback = agentParticipant.callbacks[0];
        const agentParticipantCalls = agentParticipant.calls;
        const { callbackNumbers } = agentParticipantCallback;

        let pendingCallbackNumber = false;

        for (let i = 0; i < callbackNumbers.length; i += 1) {
          const callbackNumber = callbackNumbers[i].slice(-10);
          const agentParticipantCall = agentParticipantCalls
            .find((call) => call.other.addressNormalized.endsWith(callbackNumber));

          if (!agentParticipantCall) {
            console.log('pending callback number:', callbackNumber);
            pendingCallbackNumber = true;
            break;
          }
        }

        if (pendingCallbackNumber === false) {
          endPreview();
        }
      });
  }
};

fetch(`https://api.mypurecloud.com/api/v2/conversations/${conversationId}/participants/${agentParticipantId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    state: 'connected',
  }),
  headers: {
    Authorization: `Bearer ${window.accessToken}`,
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then((response) => response.json())
  .then((json) => console.log(json));

fetch('https://api.mypurecloud.com/api/v2/notifications/channels', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${window.accessToken}`,
    'Content-type': 'application/json; charset=UTF-8',
  },
})
  .then((response) => response.json())
  .then((json) => {
    console.log(json);
    channelId = json.id;
    const webSocket = new WebSocket(json.connectUri);
    webSocket.addEventListener('open', handleWebSocketOpen);
    webSocket.addEventListener('message', handleWebSocketMessage);
  });
