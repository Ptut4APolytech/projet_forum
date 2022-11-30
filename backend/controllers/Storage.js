'use strict';

var utils = require('../utils/writer.js');
var Storage = require('../services/StorageService.js');

module.exports.downloadFile = async function (req, res, next) {

    const path = req.body.path;

    Storage.downloadFile(path).then(function (response) {
        response
            // Erreur de réponse
            .on("error", (err) => {
                utils.writeJson(res, err);
            })
            // Réponse réussie
            .on("response", (storageResponse) => {
                res.setHeader(
                    "content-type",
                    storageResponse.headers["content-type"]
                );
                res.setHeader(
                    "content-length",
                    storageResponse.headers["content-length"]
                );
            })
            // Fin de la réponse
            .on("end", () => res.end())
            .pipe(res);
    })
    .catch(function (response) {
        utils.writeJson(res, response);
    });
};

module.exports.uploadFile = function (req, res, next) {

    const file = req.files.file[0];
    const path = req.body.path;

    Storage.uploadFile(file, path).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (response) {
        utils.writeJson(res, response);
    });
};

module.exports.removeFile = function (req, res, next) {

    const path = req.body.path;

    Storage.removeFile(path).then(function (response) {
        utils.writeJson(res, response);
    }).catch(function (error) {
        utils.writeJson(res, response);
    });
};