/**
 * Created by bogdan on 09.02.18.
 */
const fs = require('mz/fs');
const RequestController = require('./request-controller');

function Combiner(args) {

    let containersNames = [];


    /* private methods */

    /**
     * Read files name in dir
     *
     * @param dir - path to dir
     * @return {Promise}
     */
    const readBlockNames = (dir) => {
        return fs.readdir(__dirname + dir);
    };

    /**
     * Create combinations from set
     *
     * @param arr
     * @param len - number of elements in combination
     * @param startPosition
     * @param result
     * @param callback
     */
    const combine = (arr, len, startPosition, result, callback) => {

        if (len === 0) {
            callback(result.slice());
            return;
        }
        for (let i = startPosition; i <= arr.length - len; i++) {
            result[result.length - len] = arr[i];
            combine(arr, len - 1, i + 1, result, callback);
        }
    };

    /**
     * Shuffle array
     *
     * @param a -array to shuffle
     * @return {Array}
     */
    const shuffle = (a) => {
        let j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    };

    const getSubset = (array, m) => {
        return shuffle(array).slice(0, m);
    };

    const getFullPath = (name) => {
        let endIndex = name.indexOf('_');
        return `../img/${name.substring(0, endIndex)}/${name}`;
    };

    const mapSmallContent = (smallContentArray) => {
        return smallContentArray.map((row) => {
            let subColArray = [];
            let temp = row.map((col, index) => {
                let offsetLeftCol = 400, offsetLeftSubCol = 220, paddingLeft = 40;
                if (Array.isArray(col)) {
                    subColArray.push({
                        src: getFullPath(col[0]),
                        x: index * offsetLeftCol + paddingLeft,
                        y: 40
                    });
                    return {
                        src: getFullPath(col[1]),
                        x: index * offsetLeftCol + offsetLeftSubCol,
                        y: 40
                    }
                } else {
                    return {
                        src: getFullPath(col),
                        x: index * offsetLeftCol + paddingLeft,
                        y: 40
                    }
                }
            });
            return temp.concat(subColArray);
        });
    };

    const mapBigContent = (bigContentArray) => {

    };

    const createPseudo = (row)=>{
        return row
            .map(item=>{
                let startIndex, endIndex;
                startIndex = item.src.lastIndexOf('/')+1;
                endIndex = item.src.lastIndexOf('_');
                return item.src.substring(startIndex, endIndex)})
            .reduce((acc, item, index,array)=>{
                if(index === 1)
                    return `${acc} {\n${item} `;
                if(index === array.length-1)
                    return `${acc} ${item}\n}`;
                else
                    return `${acc} ${item} `;
            });
    };

    const containSmall = (containers, smallContent)=>{
        let sketchesPseudo = [];
        let sketchesBlocks = smallContent.map((row)=>{
            // console.log(row);
            let newRow = [{src: getFullPath(containers[Math.floor(Math.random()*containers.length)]),
            x: 20, y: 10}].concat(row);
            sketchesPseudo.push(createPseudo(newRow));
            return newRow;
        });
        return {sketchesBlocks, sketchesPseudo};
    };

    /* public methods */
    this.produce = () => {
        return new Promise((resolve, reject) => {
            let allDirArray = args.containers.concat(args.rectangles).concat(args.ellipses);
            let requestCtrl = new RequestController(allDirArray, readBlockNames);

            requestCtrl.subscribe('error', (err, data) => {
                console.log('error', err, 'data', data);
            });

            requestCtrl.subscribe('finish', (blockNames) => {
                // console.log(blockNames);

                let smallBlockCombinations = [];// - consists of 3rd type blocks by 2; [[ellipse3, rect3]]
                let shortBlockArray = []; // - consists of 2nd type blocks and smallBlockCombinations, join arrays; [[ellipse3, rect3]] + [rect2]
                let tollBlockCombinations = []; // - consists of shortBlockArray by 2; [[ [ellipse3, rect3], rect2 ] ]
                let bigBlockArray = []; // - consists of 1st type blocks and tollBlockCombinations, join arrays; [[ [ellipse3, rect3], rect2 ]]+[];
                let smallContainerContentComb = [];// - consists of shortBlockArray by 3; [[], [], []]
                let bigContainerContentComb = [];// - consist of bigBlockArray by 3; [[[],[]], [[],[]], [[],[]]]


                // combine(['A','B', 'C','D', 'E'], 2, 0, new Array(2), (item)=>{combinations.push(item)});
                // console.log(combinations);
                combine(blockNames[4].slice().concat(blockNames[7]), 2, 0, new Array(2), (item) => {
                    smallBlockCombinations.push(item)
                }); // 1600
                shortBlockArray = blockNames[3].concat(blockNames[6]).concat(smallBlockCombinations); // 1600

                combine(shortBlockArray, 2, 0, new Array(2), (item) => {
                    tollBlockCombinations.push(item)
                }); // 1646105
                tollBlockCombinations = getSubset(tollBlockCombinations, 200); //200
                bigBlockArray = tollBlockCombinations.concat(blockNames[2]).concat(blockNames[5]); // 230

                shortBlockArray = getSubset(shortBlockArray, 200);
                combine(shortBlockArray, 3, 0, new Array(3), (item) => {
                    smallContainerContentComb.push(item)
                });// 1313300

                smallContainerContentComb = getSubset(smallContainerContentComb, 875);

                combine(bigBlockArray, 3, 0, new Array(3), (item) => {
                    bigContainerContentComb.push(item)
                }); // 2001460

                bigContainerContentComb = getSubset(bigContainerContentComb, 875);


                smallContainerContentComb = mapSmallContent(smallContainerContentComb);

                // console.log(smallContainerContentComb);

                let {sketchesBlocks, sketchesPseudo} = containSmall(blockNames[1], smallContainerContentComb);

                console.log(sketchesBlocks);

                resolve({
                    // sketchesBlocks: [[{src: '../img/1.png', x: 0, y: 0}, {src: '../img/2.png', x: 0, y: 100}],
                    //     [{src: '../img/2.png', x: 0, y: 0}, {src: '../img/1.png', x: 0, y: 100}]],
                    sketchesBlocks: sketchesBlocks.slice(0, 2),
                    // sketchesBlocks,
                    sketchesPseudo: sketchesPseudo.slice(0, 2)
                })

            });

            requestCtrl.makeRequests(false);

        });
    }
}

module.exports = Combiner;