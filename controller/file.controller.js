const path = require('path')

class FileController {
    async uploadImage(req, res) {
        console.log(req.file);
        res.json('/image')    
    }

    async getImage(req, res) {
        const {filename} = req.params;
        const dirname = path.resolve();
        const fullfilepath = path.join(dirname, 'images/' + filename);
        return res.sendFile(fullfilepath);
    }
}

module.exports = new FileController()