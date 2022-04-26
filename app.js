const express = require('express');
const multer = require('multer');
const path = require('path');

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
var boxes;
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

var myFilePath;

let {PythonShell} = require('python-shell');
//const { rsqrt } = require('@tensorflow/tfjs-core');
//const tf = require('@tensorflow/tfjs-node');
//const model = await tf.node.loadSavedModel('./sentimentModel', [tag], signatureKey);
app.get('/initialdata', call_easyocr);

function call_easyocr(req, res) {
    var options = {
        args: [myFilePath]
    }
    PythonShell.run('./easyocrimg.py', options, function( err, data){
        if (err) res.send(err);
        boxes = data;
        res.send(data.toString())
    });
}
app.post('/upload-single', upload.single('file'), function (req, res, next) {
    console.log(JSON.stringify(req.file));
    myFilePath = req.file.path;
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    response += '<a href="/initialdata">See data</a>'
    return res.send(response)
})


app.listen(process.env.PORT || 5000, () => console.log(`Listening on port 3000...`));

/*
app.post('/upload', (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('test_input');

    upload(req, res, function(err) {
        console.log(req.file.path);
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        var myPath = "./" + req.file.path;
        
        console.log(myPath);
        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${myPath}" width="500"><hr /><a href="./">Upload another image</a>`);
    });
});
*/