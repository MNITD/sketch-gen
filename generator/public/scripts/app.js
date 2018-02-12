/**
 * Created by bogdan on 09.02.18.
 */
import mergeImages from 'merge-images';
import Socket from './ws.js';

let socket = new Socket();

// const merge = (images, options)=>{
//     //return mergeImages(['/body.png', '/eyes.png', '/mouth.png'])
//     return mergeImages(images, options);
// };

socket.subscribe('message', (event)=>{
    let data = JSON.parse(event.detail.getOriginalEvent().data);
    if(data.images)
        mergeImages(data.images, data.options).then(b64=>{
            // let img = document.createElement('img');
            // img.src = b64;
            // document.body.appendChild(img);
            socket.send({result: b64})})
});

