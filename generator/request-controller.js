/**
 * Created by bogdan on 07.02.18.
 */
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}



function RequestController(iterable, func) {
    const myEmitter = new MyEmitter();

    const responses = [];
    let index = -1;

    const next = ()=>{
        let item = iterable.shift();
        index++;
        console.log('item', item, 'index', index);
        if(item)
            func(item)
                .then(data=>{
                    responses.push(data);
                    myEmitter.emit('next', data, item, index); // recursion ?
                })
                .catch(err=>{
                    myEmitter.emit('error', err, item);
                    myEmitter.emit('next', data, item, index); // recursion ?
                });
        else
            myEmitter.emit('finish', responses);
    };



    this.subscribe = (event, handler)=>{
        myEmitter.on(event, handler)
    };

    this.resume = ()=>{
        myEmitter.emit('resume');
    };

    this.makeRequests = (enablePause)=>{
        if(enablePause)
            this.subscribe('resume', next);// recursion ?
        else{
            this.subscribe('next', next);// recursion ?
        }
        next();
    };


}

module.exports =  RequestController;