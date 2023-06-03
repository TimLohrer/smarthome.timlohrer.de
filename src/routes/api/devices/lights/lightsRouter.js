const { Router } = require('express');
const lightsRouter = Router();

const getDevice = async (req, res, next) => {
    const { deviceId } = req.params;
    const tradfriClient = await require('../../../../utils/getGateway')();
    const device = Object.values(tradfriClient.devices).find(d => d.type == 2 && d.instanceId == deviceId);
    if (!device) {
        return res.status(400).json({
            message: 'Light does not exist!'
        });
    }
    req.device = device;
    req.tradfriClient = tradfriClient;
    next();
}

lightsRouter.get('/', async (req, res) => {
    const tradfriClient = await require('../../../../utils/getGateway')();
    let devices = [];
    Object.values(tradfriClient.devices).forEach(d => {
        if (d.type != 2) {
            return;
        }
        devices.push(d);
    });
    res.status(200).json(devices);
});

lightsRouter.get('/:deviceId', getDevice, async (req, res) => {
    res.status(200).json(req.device);
});

lightsRouter.post('/:deviceId/update', getDevice, async (req, res) => {
    const tradfriClient = req.tradfriClient;
    let device = req.device;
    const { name } = req.body;
    device.name = name ? name : device.name;
    try {
        await tradfriClient.updateDevice(device);
        res.status(200).json(device);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            message: e
        });
    }
});

lightsRouter.post('/:deviceId/operate', getDevice, async (req, res) => {
    const tradfriClient = req.tradfriClient;
    let device = req.device;
    let { onOff, dimmer, transitionTime, colorTemperature, color, hue, saturation } = req.body;
    if (color == 'cold') {
        color = 'f1e0b5';
        colorTemperature = 0;
    } else if (color == 'normal') {
        color = 'f1e0b5';
        colorTemperature = 40.2;
    } else if (color == 'warm') {
        color = 'f1e0b5';
        colorTemperature = 100;
    }
    try {
        await tradfriClient.operateLight(
            device,
            {
                onOff: onOff,
                dimmer: parseFloat(dimmer),
                transitionTime: parseInt(transitionTime),
                colorTemperature: parseInt(colorTemperature),
                color: color,
                hue: parseInt(hue),
                saturation: parseInt(saturation)
            },
            true
        );
        device.lightList[0].onOff = onOff ? onOff : device.lightList[0].onOff;
        device.lightList[0].dimmer = dimmer ? parseFloat(dimmer) : device.lightList[0].dimmer;
        device.lightList[0].transitionTime = transitionTime ? parseInt(transitionTime) : device.lightList[0].transitionTime;
        device.lightList[0].colorTemperature = colorTemperature ? parseInt(colorTemperature) : device.lightList[0].colorTemperature;
        device.lightList[0].color = color ? color : device.lightList[0].color;
        device.lightList[0].hue = hue ? parseInt(hue) : device.lightList[0].hue;
        device.lightList[0].saturation = saturation ? parseInt(saturation) : device.lightList[0].saturation;
        res.status(200).json(device);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            message: e
        });
    }
});

module.exports = lightsRouter;
