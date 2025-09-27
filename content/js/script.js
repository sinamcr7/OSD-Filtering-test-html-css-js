document.querySelectorAll(".range-container").forEach((container) => {
    const rangeInput = container.querySelector("input[type='range']");
    const valueBubble = container.querySelector(".value-bubble");

    function updateRange() {
        const value = rangeInput.value;
        const max = rangeInput.max;
        const min = rangeInput.min;

        // محاسبه موقعیت حباب
        const percent = ((value - min) / (max - min)) * 100;
        valueBubble.style.left = `calc(${percent}% - ${valueBubble.offsetWidth / 2}px)`;

        // تنظیم مقدار حباب
        valueBubble.textContent = value;

        // به‌روزرسانی رنگ پس‌زمینه
        rangeInput.style.background = `linear-gradient(to right, #6FDDD2 ${percent}%, #ccc ${percent}%)`;
    }

    // اجرای اولیه
    updateRange();

    // افزودن رویداد برای تغییر مقدار
    rangeInput.addEventListener("input", updateRange);
});

window.onload = function () {
    let viewer = OpenSeadragon({
        id: "viewer",
        prefixUrl: "/lib/osd/openseadragon/images/",
        tileSources: "storage/20/20.dzi",
        sequenceMode: false,
        overlayPreserveContentDirection: true,
        defaultZoomLevel: 1,
        minZoomLevel: 1,
        maxZoomLevel: 160,
        imageLoaderLimit: 10,
        maxImageCacheCount: 2000,
        preserveImageSizeOnResize: true,
        timeout: 100000,
        tileRetryMax: 0,
        tileRetryDelay: 2500,
        maxTilesPerFrame: 100,
        drawer: "canvas",
        constrainDuringPan: true,
        visibilityRatio: 1,
        showNavigationControl: false,
        showNavigator: true,
        crossOriginPolicy: "Anonymous",
    });

    Caman.Store.put = function () {
    };
    const availableFilters = [
        {
            name: 'Invert',
            generate: function() {
                return {
                    html: '',
                    getParams: function() {
                        return '';
                    },
                    getFilter: function() {
                        /*eslint new-cap: 0*/
                        return OpenSeadragon.Filters.INVERT();
                    }
                };
            }
        }, {
            name: 'Contrast',
            help: 'Range is from 0 to infinity, although sane values are from 0 ' +
                'to 4 or 5. Values between 0 and 1 will lessen the contrast ' +
                'while values greater than 1 will increase it.',
            generate: function(updateCallback) {
                const $html = $('<div></div>');
                const spinnerSlider = new SpinnerSlider({
                    $element: $html,
                    init: 1.3,
                    min: 0,
                    sliderMax: 4,
                    step: 0.1,
                    updateCallback: updateCallback
                });
                return {
                    html: $html,
                    getParams: function() {
                        return spinnerSlider.getValue();
                    },
                    getFilter: function() {
                        return OpenSeadragon.Filters.CONTRAST(
                            spinnerSlider.getValue());
                    }
                };
            }
        }, {
            name: 'Exposure',
            help: 'Range is -100 to 100. Values < 0 will decrease ' +
                'exposure while values > 0 will increase exposure',
            generate: function(updateCallback) {
                const $html = $('<div></div>');
                let value = $("#exposure").val()
                // const spinnerSlider = new SpinnerSlider({
                //     $element: $html,
                //     init: 10,
                //     min: -100,
                //     max: 100,
                //     step: 1,
                //     updateCallback: updateCallback
                // });
                return {
                    html: $html,
                    getParams: function() {
                        return value;
                    },
                    getFilter: function() {
                        // const value = spinnerSlider.getValue();
                        return function(context) {
                            const promise = getPromiseResolver();
                            Caman(context.canvas, function() {
                                this.exposure(value);
                                this.render(promise.call.back);
                            });
                            return promise.promise;
                        };
                    }
                };
            }
        }, {
            name: 'Gamma',
            help: 'Range is from 0 to infinity, although sane values ' +
                'are from 0 to 4 or 5. Values between 0 and 1 will ' +
                'lessen the contrast while values greater than 1 will increase it.',
            generate: function(updateCallback) {
                const $html = $('<div></div>');
                const spinnerSlider = new SpinnerSlider({
                    $element: $html,
                    init: 0.5,
                    min: 0,
                    sliderMax: 5,
                    step: 0.1,
                    updateCallback: updateCallback
                });
                return {
                    html: $html,
                    getParams: function() {
                        return spinnerSlider.getValue();
                    },
                    getFilter: function() {
                        const value = spinnerSlider.getValue();
                        return OpenSeadragon.Filters.GAMMA(value);
                    }
                };
            }
        }, {
            name: 'Saturation',
            help: 'saturation value has to be between -100 and 100',
            generate: function(updateCallback) {
                const $html = $('<div></div>');
                const spinnerSlider = new SpinnerSlider({
                    $element: $html,
                    init: 50,
                    min: -100,
                    max: 100,
                    step: 1,
                    updateCallback: updateCallback
                });
                return {
                    html: $html,
                    getParams: function() {
                        return spinnerSlider.getValue();
                    },
                    getFilter: function() {
                        const value = spinnerSlider.getValue();
                        return function(context) {
                            const promise = getPromiseResolver();
                            Caman(context.canvas, function() {
                                this.saturation(value);
                                this.render(promise.call.back);
                            });
                            return promise.promise;
                        };
                    }
                };
            }
        }, {
            name: 'Greyscale',
            generate: function() {
                return {
                    html: '',
                    getParams: function() {
                        return '';
                    },
                    getFilter: function() {
                        return OpenSeadragon.Filters.GREYSCALE();
                    }
                };
            }
        }, {
            name: 'Sobel Edge',
            generate: function() {
                return {
                    html: '',
                    getParams: function() {
                        return '';
                    },
                    getFilter: function() {
                        return function(context) {
                            const imgData = context.getImageData(
                                0, 0, context.canvas.width, context.canvas.height);
                            const pixels = imgData.data;
                            const originalPixels = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
                            const oneRowOffset = context.canvas.width * 4;
                            const onePixelOffset = 4;
                            let Gy, Gx, idx = 0;
                            for (let i = 1; i < context.canvas.height - 1; i += 1) {
                                idx = oneRowOffset * i + 4;
                                for (let j = 1; j < context.canvas.width - 1; j += 1) {
                                    Gy = originalPixels[idx - onePixelOffset + oneRowOffset] + 2 * originalPixels[idx + oneRowOffset] + originalPixels[idx + onePixelOffset + oneRowOffset];
                                    Gy = Gy - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - oneRowOffset] + originalPixels[idx + onePixelOffset - oneRowOffset]);
                                    Gx = originalPixels[idx + onePixelOffset - oneRowOffset] + 2 * originalPixels[idx + onePixelOffset] + originalPixels[idx + onePixelOffset + oneRowOffset];
                                    Gx = Gx - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - onePixelOffset] + originalPixels[idx - onePixelOffset + oneRowOffset]);
                                    pixels[idx] = Math.sqrt(Gx * Gx + Gy * Gy); // 0.5*Math.abs(Gx) + 0.5*Math.abs(Gy);//100*Math.atan(Gy,Gx);
                                    pixels[idx + 1] = 0;
                                    pixels[idx + 2] = 0;
                                    idx += 4;
                                }
                            }
                            context.putImageData(imgData, 0, 0);
                        };
                    }
                };
            }
        }, {
            name: 'Brightness',
            help: 'Brightness must be between -255 (darker) and 255 (brighter).',
            generate: function(updateCallback) {
                const $html = $('<div></div>');
                const spinnerSlider = new SpinnerSlider({
                    $element: $html,
                    init: 50,
                    min: -255,
                    max: 255,
                    step: 1,
                    updateCallback: updateCallback
                });
                return {
                    html: $html,
                    getParams: function() {
                        return spinnerSlider.getValue();
                    },
                    getFilter: function() {
                        return OpenSeadragon.Filters.BRIGHTNESS(
                            spinnerSlider.getValue());
                    }
                };
            }
        }];

    let activeFilters = [];

    function getPromiseResolver() {
        let call = {};
        let promise = new OpenSeadragon.Promise(resolve => {
            call.back = resolve;
        });
        return {call, promise};
    }

    function updateViewerFilters(viewer) {
        const processors = Object.values(activeFilters).map(f => f.getFilter());
        const sync = Object.values(activeFilters).every(f => f.sync !== false);

        viewer.setFilterOptions({
            filters: {
                items: viewer.world.getItemAt(0),
                processors: processors
            },
            loadMode: sync ? 'sync' : 'async'
        });
        // for ( var i = 0; i < viewer.world.getItemCount(); i++ ) {
        //     viewer.world.getItemAt(i).tilesMatrix={};
        //     viewer.world.getItemAt(i)._needsDraw = true;
        // }

    }

    viewer.gestureSettingsMouse.clickToZoom = false;

    viewer.gestureSettingsMouse.dblClickToZoom = true;
    viewer.addHandler('pan', () => {
        viewer.imageLoader.jobLimit = 1;
        viewer.addOnceHandler('animation-finish', () => {
            viewer.imageLoader.jobLimit = 200; // or whatever it was originally
        });
    });

    $("#checkbxI").off("click").on("click", function () {
        // Openseadragon filtering
        const filterDef = availableFilters.find(f => f.name === "Invert");
        const generatedFilter = filterDef.generate();
        if (this.checked) {
            // // CSS filtering
            // filters.invert = 1;
            // applyFilters()

            // Openseadragon filtering
            activeFilters["Invert"] = generatedFilter;

        } else {
            // // CSS filtering
            // filters.invert = 0;
            // applyFilters();

            // Openseadragon filtering
            delete activeFilters["Invert"];
        }
        // Openseadragon filtering
        updateViewerFilters(viewer);
    });

    $("#checkbxG").off("click").on("click", function () {
        // Openseadragon filtering
        const filterDef = availableFilters.find(f => f.name === "Greyscale");
        const generatedFilter = filterDef.generate();
        if (this.checked) {
            // // CSS filtering
            // filters.greyscale = 1;
            // applyFilters()

            // Openseadragon filtering
            activeFilters["Greyscale"] = generatedFilter;

        } else {
            // // CSS filtering
            // filters.greyscale = 0;
            // applyFilters();

            // Openseadragon filtering
            delete activeFilters["Greyscale"];
        }
        // Openseadragon filtering
        updateViewerFilters(viewer);
    });

    $("#checkbxS").off("click").on("click", function () {
        // Openseadragon filtering
        const filterDef = availableFilters.find(f => f.name === "Sobel Edge");
        const generatedFilter = filterDef.generate();
        if (this.checked) {
            activeFilters["Sobel Edge"] = generatedFilter;
        } else {
            delete activeFilters["Sobel Edge"];
        }
        updateViewerFilters(viewer);
    });

    $("#brightness").on("input", function () {
        // Openseadragon filtering
        const value = parseInt(this.value, 10) - 100;
        activeFilters["Brightness"] = {
            getFilter: () => OpenSeadragon.Filters.BRIGHTNESS(value),
            sync: true
        };
        updateViewerFilters(viewer);
        // // CSS filtering
        // filters.brightness = this.value / 100;
        // applyFilters();
    });

    $("#contrast").on("input", function () {
        // Openseadragon filtering
        const value = parseInt(this.value, 10) / 100;
        activeFilters["Contrast"] = {
            getFilter: () => OpenSeadragon.Filters.CONTRAST(value),
            sync: true
        };
        updateViewerFilters(viewer);
        // // CSS filtering
        // filters.contrast = this.value / 100;
        // applyFilters();
    });

    $("#gamma").on("input", function () {
        // Openseadragon filtering
        const value = parseFloat(this.value);
        activeFilters["Gamma"] = {
            getFilter: () => OpenSeadragon.Filters.GAMMA(value),
            sync: true
        };
        updateViewerFilters(viewer);
        // // CSS filtering
        // filters.gamma = this.value;
        // applyFilters();
    });

    $("#exposure").on("input", function () {
        // Openseadragon filtering
        const value = parseInt(this.value, 10) - 50; // center at 50 = no change
        const filterDef = availableFilters.find(f => f.name === "Exposure");
        const generatedFilter = filterDef.generate();
        activeFilters["Exposure"] = generatedFilter(value);
        updateViewerFilters(viewer);

        // // CSS filtering
        // filters.exposure = this.value / 100;
        // applyFilters();
    });

    $("#saturation").on("input", function () {
        // Openseadragon filtering
        const value = parseInt(this.value, 10) - 100; // center at 100 = no change
        const filterDef = availableFilters.find(f => f.name === "Saturation");
        const generatedFilter = filterDef.generate();
        activeFilters["Saturation"] = generatedFilter(value);
        updateViewerFilters(viewer);

        // // CSS filtering
        // filters.saturation = this.value / 100;
        // applyFilters();
    });

}
