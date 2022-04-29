const express = require('express');
const multer = require('multer');
const path = require('path');
const cv2 = require('opencv.js');
const app = express();




const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer ({ storage: storage});

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));


var myFilePath;
var newFilePath = 'outputimgs/' + String(Date.now()) + '_output.png';

let {PythonShell} = require('python-shell');
const Jimp = require('jimp');
//const { rsqrt } = require('@tensorflow/tfjs-core');
//const tf = require('@tensorflow/tfjs-node');
//const model = await tf.node.loadSavedModel('./sentimentModel', [tag], signatureKey);
app.get('/initialdata', call_new_easyocr);

app.get('/newimage', function(req, res) {

})
async function call_new_easyocr(req, res){
    var options = {
        args: [myFilePath]
    }
    
    const { success, err = '', data } = await new Promise(
        (resolve, reject) =>
        {
            PythonShell.run('./easyocrimg.py', options, function(err, data){
                if (err) {
                    reject({ success : false, err});
                };
                
                
                dataAsArray = data;
                dataAsArray = JSON.parse(dataAsArray);

                return writeBoxes(dataAsArray).then(function(err) {;
                    resolve({ success: true, data});
                    res.sendFile(__dirname + '/' + newFilePath);
                }).catch(function () {
                    console.log("rejected");
                })
                /*
                writeBoxes(dataAsArray).then(ret_val => {
                    
                    return res.sendfile(__dirname + '/' + ret_val);
                    
                    
                })
                // response += `<img src="/outputimgs/${Date.now()}_output.png" >`
                resolve({ success: true, data});
                console.log(__dirname + myPath);
                return res.sendfile(__dirname + '/' + newFilePath);
                //return res.send(__dirname + myPath);
                
                //return res.send(dataAsArray[0][0])
                */
        
            });
        }
    )
    if (!success){
        console.log(err);
        return;
    }
}

async function writeBoxes(boxes){
    var jimpSrc = await Jimp.read(myFilePath);
    var src = cv2.matFromImageData(jimpSrc.bitmap);
        
    var newimg = addBoxes(src, boxes);
    return new Jimp({
                    width: src.cols,
                    height: src.rows,
                    data: Buffer.from(newimg.data)
                  })
                  .writeAsync(newFilePath).then( function (err, file) {
                      if (err) throw err;

                  }).catch(function() {
                      console.log("rejected");
                  });
                  
                      
    //return newImagePath;

}
app.post('/upload-single', upload.single('file'), function (req, res, next) {
    console.log(JSON.stringify(req.file));
    myFilePath = req.file.path;
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    response += '<a href="/initialdata">See data</a>'
    // console.log(myFilePath);
    return res.send(response)
})
function addBoxes(image, boxes){
    for (let i = 0; i < boxes.length; i++){
        let point1 = new cv2.Point(boxes[i][0][0], boxes[i][0][1]);
        let point2 = new cv2.Point(boxes[i][1][0], boxes[i][1][1]);
        cv2.rectangle(image, point1, point2, [255, 0, 0, 255]);
    }
  return image
}


app.listen(process.env.PORT || 5000, () => console.log(`Listening on port 5000...`));

