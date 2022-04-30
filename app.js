const express = require('express');
const multer = require('multer');
const path = require('path');
const cv2 = require('opencv.js');
const app = express();



// Initialize Multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    // Make filename unique by including the current time
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer ({ storage: storage});

// static figuration
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));


var myFilePath;
// Also declare unique file path for the annotated image
var newFilePath = 'outputimgs/' + String(Date.now()) + '_output.png';

let {PythonShell} = require('python-shell');
const Jimp = require('jimp');

app.get('/initialdata', call_new_easyocr);

/**
 * Function to activate the python shell to run the easyocr
 * inference scheme. The input image, denoted by the myFilePath global variable
 * (which is initialized before this func call) is provided as an
 * argument for the python function call inside. The .py file then runs
 * easyocr API call to get bounding box coordinates, and returns them.
 * Then we asynchronously call writeBoxes to add bounding boxes to the image.
 * After that function call is finished, send the annotated image to the browser.
 * 
 */
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
/**
 * Function to accept image as an input and a hyperlink
 * to call the python script.
 */
app.post('/upload-single', upload.single('file'), function (req, res, next) {
    console.log(JSON.stringify(req.file));
    myFilePath = req.file.path;
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    response += '<a href="/initialdata">See image with bounding boxes</a>'
    // console.log(myFilePath);
    return res.send(response)
})

// Function that accepts image and array of boxes as an argument.
// Uses cv's rectangle method to draw rectangular boxes on the image.
function addBoxes(image, boxes){
    for (let i = 0; i < boxes.length; i++){
        let point1 = new cv2.Point(boxes[i][0][0], boxes[i][0][1]);
        let point2 = new cv2.Point(boxes[i][1][0], boxes[i][1][1]);
        cv2.rectangle(image, point1, point2, [255, 0, 0, 255], 4);
    }
  return image
}

// Change port number to 5000 when deploying on heroku
app.listen(process.env.PORT || 3000, () => console.log(`Listening on port 3000...`));

