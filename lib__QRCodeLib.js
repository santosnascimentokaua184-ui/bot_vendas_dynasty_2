const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common');

let canvas;
try {
    canvas = require('canvas');
} catch (e) {
    console.warn('[QRCodeLib] Módulo canvas não disponível. QR codes estilizados desabilitados.');
    canvas = null;
}

class qrGenerator {
    constructor({ imagePath }) {
        this.imagePath = imagePath;
    }

    generate = async function (data) {
        if (!canvas) {
            return { status: 'error', response: 'Canvas não disponível neste ambiente.' };
        }
        this.options = createOptions(data, this.imagePath);
        this.qrCodeImage = createQRCodeStyling(canvas, this.options);
        return await getRawData(this.qrCodeImage);
    }
}

function createOptions(data, image) {
    return {
        width: 1000, height: 1000, data, image, margin: 10,
        dotsOptions: {
            gradient: { type: "radial", rotation: 0, colorStops: [{ offset: 0, color: "#000000" }, { offset: 2, color: "#000000" }] },
            color: "#000000", type: "square"
        },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { hideBackgroundDots: false, crossOrigin: "anonymous", imageSize: 0.4, margin: 5 },
        cornersDotOptions: { color: "#000000", type: 'square' },
        cornersSquareOptions: { color: "#000000", type: 'square' },
        cornersDotOptionsHelper: { color: "#000000", type: 'square' }
    };
}

function createQRCodeStyling(nodeCanvas, options) {
    return new QRCodeStyling({ nodeCanvas, ...options });
}

async function getRawData(qrCodeImage) {
    return qrCodeImage.getRawData("png").then(r => ({ status: 'success', response: r.toString('base64') }))
        .catch(e => ({ status: 'error', response: e }));
}

module.exports.qrGenerator = qrGenerator;
