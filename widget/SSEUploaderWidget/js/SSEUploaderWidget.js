/**
 *  SSE File Uploader Widget
 *  by LAD Commerce SC Team
 *  root/widget/SSEUploaderWidget/js/SSEUploaderWidget.js
 */

define(
    //-----------------
    // DEPENDENCIES
    //-----------------
    ['knockout', 'jquery', 'notifier', 'spinner'],
    //-----------------
    // MODULE DEFINITION
    //-----------------
    function (ko, $, notifier, spinner) {
        "use strict";
        var widget;
        return {
            extensionItems: ko.observableArray([]),
            onLoad: function (widgetModel) {
                widget = widgetModel;
                console.log("-- SSE File Uploader Widget Loaded");
                widget.populateExtensionsList();
            },
            readCookie: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) {
                        var str = unescape(c.substring(nameEQ.length, c.length));
                        return (str.substring(1, str.length - 2));

                    }
                }
                return null;
            },
            getAdminToken: function () {
                var adminToken = sessionStorage.getItem('oauth_token_secret-adminUI');
                if (adminToken === null || admintToken === '')
                    adminToken = widget.readCookie('oauth_token_secret-adminUI');
                return adminToken;
            },
            populateExtensionsList: function () {
                var myInit = {
                    'method': 'GET',
                    'headers': new Headers({
                        "Authorization": "Bearer " + widget.getAdminToken()
                    })
                };
                fetch('/ccadminui/v1/serverExtensions/', myInit)
                    .then(
                        function (response) {
                            if (response.ok === false) {
                                notifier.sendError('SSE_UPLOADER', response.status + ' - ' + response.statusText + ' = Error updating SSE List!', true);
                                return;
                            }
                            response.json().then(function (data) {
                                widget.extensionItems([]);
                                for (var item in data.items) {
                                    var newItem = {};
                                    newItem.name = ko.observable(data.items[item].name);
                                    widget.extensionItems.push(newItem);
                                }
                                notifier.sendSuccess('SSE_UPLOADER', 'Updated SSE List', true);
                            });
                        }
                    )
                    .catch(function (err) {
                        notifier.sendError('SSE_UPLOADER', err + ' = Error updating SSE List!', true);
                    });
            },
            deleteExtension: function (name) {
                var myInit = {
                    'method': 'DELETE',
                    'headers': new Headers({
                        "Authorization": "Bearer " + widget.getAdminToken()
                    })
                };
                fetch('/ccadminui/v1/serverExtensions/' + name(), myInit)
                    .then(
                        function (response) {
                            if (response.ok === false) {
                                notifier.sendError('SSE_UPLOADER', response.status + ' - ' + response.statusText + ' = Error deleting extension "' + name() + '"', true);
                                return;
                            }
                            notifier.sendSuccess('SSE_UPLOADER', 'Successfully deleted extension "' + name() + '"', true);
                            widget.populateExtensionsList();
                        }
                    )
                    .catch(function (err) {
                        notifier.sendError('SSE_UPLOADER', response.status + ' - ' + response.statusText + ' = Error deleting extension "' + name() + '"', true);
                    });
            },
            sendFileToOCC: function () {
                spinner.create({
                    parent: document.body
                });
                var fileList = document.getElementById('files').files;
                var d = new FormData();
                d.append('uploadType', 'extensions');
                d.append('fileUpload', fileList[0]);
                d.append('force', 'true');
                d.append('filename', fileList[0].name);
                var myInit = {
                    'method': 'POST',
                    'headers': new Headers({
                        "Authorization": "Bearer " + widget.getAdminToken()
                    }),
                    'body': d
                };
                fetch('/ccadminui/v1/serverExtensions', myInit)
                    .then(
                        function (response) {
                            if (response.ok === false) {
                                spinner.destroy();
                                notifier.sendError('SSE_UPLOADER', response.status + ' - ' + response.statusText + ' = Error uploading new SSE!', true);
                                document.getElementById('fileuploader').reset();
                                return;
                            }
                            spinner.destroy();
                            notifier.sendSuccess('SSE_UPLOADER', 'Successfully uploaded extension "' + fileList[0].name + '"', true);
                            document.getElementById('fileuploader').reset();
                            widget.populateExtensionsList();
                        })
                    .catch(function (err) {
                        spinner.destroy();
                        notifier.sendError('SSE_UPLOADER', err + ' = Error uploading new SSE!', true);
                        document.getElementById('fileuploader').reset();
                    });
            }
        };
    }
);
