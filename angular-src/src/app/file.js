'use strict';

var saveToLocalFile = function (blob, filename, filetype) {
    var e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [filetype, a.download, a.href].join(':');
    e.initEvent('click', true, false);
    a.dispatchEvent(e);
};

var loadFromLocalFile = function(callback, acceptTypes) {
    var dialog = document.createElement('input');
    dialog.type = 'file';
    if (angular.isArray(acceptTypes)) {
        dialog.accept = acceptTypes.join(',');
    } else if (angular.isString(acceptTypes)) {
        dialog.accept = acceptTypes;
    }
    callDialog(dialog, callback);
};

var callDialog = function(dialog, callback) {
    dialog.addEventListener('change', function() {
        var result = dialog.files[0];
        var r = new FileReader();
        r.onload = callback;
        r.readAsText(result);
    }, false);
    dialog.click();
};
