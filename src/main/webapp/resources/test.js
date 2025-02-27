if (PrimeFaces.widget.FileUpload) {
    // Store the original init method
    var originalInit = PrimeFaces.widget.FileUpload.prototype.init;

    // Override the init method
    PrimeFaces.widget.FileUpload.prototype.init = function(cfg) {
        // Call the original init method
        originalInit.apply(this, arguments);

        // Ensure filesFacet is initialized
        if (!this.filesFacet) {
            this.filesFacet = this.jq.find('.ui-fileupload-content .ui-fileupload-files');
        }

        // Override addFileToRow after initialization
        this.addFileToRow = function(file, data) {
            // Ensure emptyFacet is initialized
            if (this.emptyFacet && this.emptyFacet.length > 0) {
                this.emptyFacet.hide();
                this.filesFacet.parent().show();
            }

            // Create the row element as a valid jQuery object
            var row = $('<div class="ui-fileupload-row"></div>')
                .append('<div class="ui-fileupload-preview"></div>') // Ensure this element is created
                .append('<div class="ui-fileupload-filename">' + PrimeFaces.escapeHTML(file.name) + '</div>')
                .append('<div>' + PrimeFaces.utils.formatBytes(file.size) + '</div>')
                .append('<div class="ui-fileupload-progress"></div>')
                .append('<div><button class="ui-fileupload-cancel ui-button ui-widget ui-state-default ui-button-icon-only"><span class="ui-button-icon-left ui-icon ui-icon ui-icon-close"></span><span class="ui-button-text">ui-button</span></button></div>');

            // Append the row to the DOM
            if (this.filesFacet) {
                this.filesFacet.append(row);
            } else {
                console.error("filesFacet is undefined!");
            }

            // Debug: Inspect the row element and its children
            console.log("Row Element:", row);
            console.log("Row Children:", row.children());

            if (this.filesFacet && this.filesFacet.children('.ui-fileupload-row').length > 1) {
                $('<div class="ui-widget-content"></div>').prependTo(row);
            }

            // Check if the file is a JPEG or PNG and is 2GB or larger
            var isLargeImage = (file.type === 'image/jpeg' || file.type === 'image/png') && file.size >= 2147483648; // 2GB in bytes

            // Render preview only if the file is not a large JPEG or PNG
            if (!isLargeImage && window.File && window.FileReader && this.IMAGE_TYPES && this.IMAGE_TYPES.test(file.name)) {
                var previewDiv = row.find('div.ui-fileupload-preview'); // Use .find() to search for nested elements
                console.log("Preview Div:", previewDiv);
                if (previewDiv.length === 0) {
                    console.error("Preview div not found!");
                } else {
                    var imageCanvas = $('<canvas></canvas>').appendTo(previewDiv);
                    console.log("Image Canvas:", imageCanvas);
                    if (imageCanvas.length === 0) {
                        console.error("Canvas element not appended!");
                    } else {
                        var canvasElement = imageCanvas.get(0);
                        console.log("Canvas Element:", canvasElement);
                        if (!canvasElement) {
                            console.error("Canvas element is undefined!");
                        } else {
                            var context = canvasElement.getContext('2d');
                            console.log("Canvas Context:", context);

                            var winURL = window.URL || window.webkitURL,
                                url = winURL.createObjectURL(file),
                                img = new Image();

                            // Use an arrow function to preserve the context of `this`
                            img.onload = () => {
                                var imgWidth = null, imgHeight = null, scale = 1;

                                if (this.cfg.previewWidth > img.width) {
                                    imgWidth = img.width;
                                } else {
                                    imgWidth = this.cfg.previewWidth;
                                    scale = this.cfg.previewWidth / img.width;
                                }

                                imgHeight = parseInt(img.height * scale);

                                imageCanvas.attr({ width: imgWidth, height: imgHeight });
                                context.drawImage(img, 0, 0, imgWidth, imgHeight);
                            };

                            img.src = url;
                        }
                    }
                }
            }

            //progress
            row.children('div.ui-fileupload-progress')
                .append('<div class="ui-progressbar ui-widget ui-widget-content" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="ui-progressbar-value ui-widget-header" style="display: none; width: 0%;"></div></div>');

            file.row = row;
            file.row.data('fileId', this.fileId++);
            file.row.data('filedata', data);

            this.files.push(file);

            if (this.cfg.auto) {
                this.upload();
            }

            this.postSelectFile(data);
        };
    };
}