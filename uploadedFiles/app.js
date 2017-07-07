module.exports = function(app) {
    var multer = require('multer');
    var upload = multer({ dest: __dirname+'/../uploadedFiles'});

    /*
    app.post("/hallo", upload.single('formData'), uploadImage);

    function uploadImage(req, res) {

        var widgetId = req.body.widgetId;
        var width = req.body.width;
        console.log(req.file);
        var myFile = req.file;

        var originalname = myFile.originalname;
        var filename = myFile.filename;
        var path = myFile.path;
        var destination = myFile.destination;
        var size = myFile.size;

        res.send(formData);

    }
 */
};