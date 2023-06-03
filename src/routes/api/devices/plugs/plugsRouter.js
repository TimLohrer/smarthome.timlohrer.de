const { Router } = require('express');
const plugsRouter = Router();

const getDevice = async (req, res, next) => {
    const { deviceId } = req.params;
    const tradfriClient = await require('../../../../utils/getGateway')();
    const device = Object.values(tradfriClient.devices).find(d => d.type == 3 && d.instanceId == deviceId);
    if (!device) {
        return res.status(400).json({
            message: 'Plug does not exist!'
        });
    }
    req.device = device;
    req.tradfriClient = tradfriClient;
    next();
}

plugsRouter.get('/', async (req, res) => {
    const tradfriClient = await require('../../../../utils/getGateway')();
    const devices = Object.values(tradfriClient.devices).filter(d => { d.type == 3 });
    res.status(200).json(devices);
});

plugsRouter.get('/:deviceId', getDevice, async (req, res) => {
    res.status(200).json(req.device);
});

plugsRouter.post('/:deviceId/update', getDevice, async (req, res) => {
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

plugsRouter.post('/:deviceId/operate', getDevice, async (req, res) => {
    const tradfriClient = req.tradfriClient;
    let device = req.device;
    let { onOff } = req.body;
    try {
        await tradfriClient.operateLight(
            device,
            {
                onOff: onOff == 'true' ? true : false
            },
            true
        );
        device.plugList[0].onOff = onOff ? onOff == 'true' ? true : false : device.plugList[0].onOff;
        res.status(200).json(device);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            message: e
        });
    }
});

module.exports = plugsRouter;
