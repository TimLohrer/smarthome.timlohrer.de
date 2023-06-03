const { Router } = require('express');
const remotesRouter = Router();

const getDevice = async (req, res, next) => {
    const { deviceId } = req.params;
    const tradfriClient = await require('../../../../utils/getGateway')();
    const device = Object.values(tradfriClient.devices).find(d => d.type == 0 && d.instanceId == deviceId);
    if (!device) {
        return res.status(400).json({
            message: 'Remote does not exist!'
        });
    }
    req.device = device;
    req.tradfriClient = tradfriClient;
    next();
}

remotesRouter.get('/', async (req, res) => {
    const tradfriClient = await require('../../../../utils/getGateway')();
    let devices = [];
    Object.values(tradfriClient.devices).forEach(d => {
        if (d.type != 0) {
            return;
        }
        devices.push(d);
    });
    res.status(200).json(devices);
});

remotesRouter.get('/:deviceId', getDevice, async (req, res) => {
    res.status(200).json(req.device);
});

remotesRouter.post('/:deviceId/update', getDevice, async (req, res) => {
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

module.exports = remotesRouter;
