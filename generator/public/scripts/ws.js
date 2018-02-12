/**
 * Created by bogdan on 05.02.18.
 */

function Socket() {
    let socket = new WebSocket("ws://localhost:8080");

    const eventProvider = document.createElement('div');

    socket.addEventListener('message', (event) => {
        eventProvider.dispatchEvent(new CustomEvent('message', {
            detail: {
                getOriginalEvent: () => {
                    return event;
                }
            }
        }));
        console.log(event.data);
    });

    /* public methods */

    this.subscribe = (event, handler) => {
        eventProvider.addEventListener(event, handler);
    };

    this.unsubsctibe = (event, handler) => {
        eventProvider.removeEventListener(event, handler);
    };

    this.send = (msg)=>{
        socket.send(JSON.stringify(msg));
    };
}

export default Socket;