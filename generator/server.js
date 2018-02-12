/**
 * Created by bogdan on 08.02.18.
 */
const WebSocket = require('ws');
const RequestController = require('./request-controller');
const fs = require('fs');
const Combiner = require('./combiner');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

let sketchesBlocks, sketchesPseudo;

const wss = new WebSocket.Server({port: 8080});

console.log('Server listening on port 8080..');

wss.on('connection', function connection(ws) {

    /**
     * Sending data to ws client
     *
     * @param msg - data to send
     */
    const sendMessage = (msg) => {
        ws.send(JSON.stringify(msg));
    };

    /**
     * Making request, and listening on response
     *
     * @param data - request data
     * @return {Promise}
     */
    const makeRequest = (data) =>{
        return new Promise((resolve, reject)=>{
            sendMessage({images: data, options: {
                width: 1200,
                height: 400
            }});
            myEmitter.on('response', resolve);
        })
    };

    /**
     * Create .png and .gui files from response in result folder
     *
     * @param data - response data
     * @param index - request number
     */
    const processResponse = (data, index) =>{
        let sketchName = `generator/results/result${index}.png`;
        let pseudoName = `generator/results/result${index}.gui`;
        data = data.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(sketchName, data, 'base64', (err)=>{ // save img
            if (err) throw err;
            console.log(`The file [${sketchName}] has been saved!`);

            fs.writeFile(pseudoName, sketchesPseudo[index], (err)=>{ // save txt
                if (err) throw err;
                console.log(`The file [${pseudoName}] has been saved!`);
            })
        })
    };

    sendMessage('connection established');

    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);
        let msg = JSON.parse(message);
        if (msg.result)
            myEmitter.emit('response', msg.result)

    });

    //////////////////////////////
    const containerDir = ['/img/container1', '/img/container2'];
    const rectangularDir = ['/img/rectangle1','/img/rectangle2','/img/rectangle3'];
    const ellipseDir = ['/img/ellipse1','/img/ellipse2','/img/ellipse3'];
    const combiner = new Combiner({containers: containerDir, rectangles: rectangularDir, ellipses: ellipseDir});

    combiner.produce().then(result =>{
        sketchesBlocks = result.sketchesBlocks;
        sketchesPseudo = result.sketchesPseudo;
        console.log(sketchesBlocks, sketchesPseudo);


        ////////////////////////
        let requestCtrl = new RequestController(sketchesBlocks, makeRequest);

        requestCtrl.subscribe('next', (res, item, index) => { // return res of prev req
            processResponse(res, index);
        });
        requestCtrl.subscribe('error',(err, data)=>{ console.log('error', err, 'data', data);});

        requestCtrl.makeRequests(false);
        //////////////////////////////////

    });
    //////////////////////////////


});



