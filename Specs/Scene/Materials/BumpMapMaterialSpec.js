/*global defineSuite*/
defineSuite([
        'Scene/Materials/BumpMapMaterial',
        '../Specs/renderMaterial',
        '../Specs/createContext',
        '../Specs/destroyContext',
        'Renderer/PixelFormat'
    ], function(
        BumpMapMaterial,
        renderMaterial,
        createContext,
        destroyContext,
        PixelFormat) {
    "use strict";
    /*global it,waitsFor,expect*/

    var whiteImage;

    it("initialize suite", function() {
        whiteImage = new Image();
        whiteImage.src = "./Data/Images/White.png";

        waitsFor(function() {
            return whiteImage.complete;
        }, "Load .png file(s) for texture test.", 3000);
    });

    it("draws a bump map material", function() {
        var context = createContext();
        var pixel = renderMaterial(new BumpMapMaterial({
            texture : context.createTexture2D({
                source : whiteImage,
                pixelFormat : PixelFormat.LUMINANCE
            })
        }), context);
        expect(pixel).not.toEqualArray([0, 0, 0, 0]);
        destroyContext(context);
    });
});
