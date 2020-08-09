const fetch = require('node-fetch');



exports.Redirect = class Redirect {

    constructor(new_path) {
        this.redirect = new_path;
    }

    sendResponse(res) {
        res.redirect(this.redirect);
    }
};

class AssetData {
    constructor(settings) {
        this.headers = settings.headers;
        this.data = settings.data;
    }

    sendResponse(res) {
        res.set(this.headers);
        res.status(200).send(this.data);
    }
}



exports.AssetsOverride = class AssetsOverride {
    /**
     * 
     * @param {string} url 
     * @param {} data 
     */
    constructor(data) {
        this.data = new AssetData(data);
    }

    sendResponse(res) {
        this.data.sendResponse(res);
    }
};

exports.TempDirRedirect = class TempDirRedirect {
    constructor() {

    }
}