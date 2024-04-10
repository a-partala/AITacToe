class Cell
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.isFinished = false;
        this.symbol = -1;
    }

    hasPixels() {
        const ctx = this.canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixelsArray = imgData.data;
        for (let i = 0; i < pixelsArray.length; i += 4) {
            if (pixelsArray[i+3] > 0) {
                return true;
            }
        }
        return false;
    }
}

let model

async function loadModel() {
    model = await tf.loadLayersModel('model/model.json');
    console.log("model has been loaded");
    return model;
}
  
async function predict(model, grayscaleArray) {
    const tensor = tf.tensor2d([grayscaleArray], [1, grayscaleArray.length]);
  
    const prediction = model.predict(tensor);
  
    prediction.print();
  
    const pIndex = tf.argMax(prediction, 1).dataSync();
    console.log(`Предсказанный класс: ${pIndex}`);
}

async function main() {
    await loadModel();
}

document.addEventListener('DOMContentLoaded', async () => {
    await main();
    let cells = [[false, false, false],
                 [false, false, false],
                 [false, false, false],]
    //assignCells();
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let isDrawing = false;
        ctx.fillStyle = 'white';

        canvas.addEventListener('mousedown', () => {
            isDrawing = true;
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            ctx.beginPath();

        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                ctx.lineWidth = 4;
                ctx.lineCap = 'round'; 
                const rect = canvas.getBoundingClientRect();
                ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            }
        });
    });

    document.getElementById('saveBtn').addEventListener('click', function() {
        updateCells();
        if(checkWin())
        {
            console.log("victory LOL");
        }
    });

    function updateCells()
    {
        let counter = 0;
        for(let i = 0; i < 3; i++)
        {
            for(let j = 0; j < 3; j++) 
            {
                let cell = cells[i][j]
                if(cell.isFinished)
                {
                    continue;
                }
                if(cell.hasPixels())
                {
                    cell.isFinished = true;
                    setSymbol(cell);
                    console.log(`${i}; ${j}`);
                    counter++;
                    if(counter > 1)
                    {
                        window.location.reload();
                    }
                }
            }
        }
    }

    function setSymbol(cell) {
        let ctx = cell.canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, cell.canvas.width, cell.canvas.height);
    
        const grayscaleArray = [];
    
        for (let i = 0; i < imageData.data.length; i += 4) {
            a = imageData.data[i + 3];
            console.log(a)
            const gray = a / 255.0;
    
            grayscaleArray.push(gray);
        }
        const tensor = tf.tensor2d([grayscaleArray], [1, grayscaleArray.length]);
        console.log(grayscaleArray);
        const prediction = model.predict(tensor);
        
        const symbol = prediction.dataSync()[0] >= 0.5 ? 1 : 0;
        console.log(`symbol: ${symbol}`);
        cell.symbol = symbol;
    }

    function checkWin() 
    {
        let counter = 0
        let symbol = -1
        for(let i = 0; i < 3; i++)
        {
            counter = 0;
            for(let j = 0; j < 3; j++) 
            {
                let cell = cells[i][j]
                if(!cell.isFinished)
                {
                    continue;
                }
                if(j == 0)
                {
                    symbol = cell.symbol;
                }
                if(cell.symbol == symbol)
                {
                    counter++;
                }
            }
            if(counter == 3)
            {
                return true;
            }
        }
        for(let j = 0; j < 3; j++)
        {
            counter = 0;
            for(let i = 0; i < 3; i++) 
            {
                let cell = cells[i][j]
                if(!cell.isFinished)
                {
                    continue;
                }
                if(i == 0)
                {
                    symbol = cell.symbol;
                }
                if(cell.symbol == symbol)
                {
                    counter++;
                }
            }
            if(counter == 3)
            {
                return true;
            }
        }
        counter = 0;
        for(let i = 0, j = 2; i < 3; i++, j--)
        {
            let cell = cells[i][j]
            if(!cell.isFinished)
            {
                continue;
            }
            if(i == 0)
            {
                symbol = cell.symbol;
            }
            if(cell.symbol == symbol)
            {
                counter++;
            }
            if(counter == 3)
            {
                return true;
            }
        }
        counter = 0;
        for(let i = 0; i < 3; i++)
        {
            let cell = cells[i][i]
            if(!cell.isFinished)
            {
                continue;
            }
            if(i == 0)
            {
                symbol = cell.symbol;
            }
            if(cell.symbol == symbol)
            {
                counter++;
            }
            if(counter == 3)
            {
                return true;
            }
        }
        return false;
    }

    function assignCells() {
        let n = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells[i][j] = new Cell(canvases[n]);
                n++;
            }
        }
    }
    
    assignCells();
});

