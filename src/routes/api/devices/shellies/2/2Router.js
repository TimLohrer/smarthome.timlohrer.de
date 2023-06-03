const { Router } = require('express');
const shelly2Router = Router();

function getDevice(req, res, next) {
    const { deviceId } = req.params;
    const shellyClient = require('../../../../../utils/getShellyClient');
    const device = shellyClient.get(deviceId);
    if (!device) {
        return res.status(400).json({
            message: 'Shelly does not exist!'
        });
    }
    req.device = device;
    req.shellyClient = shellyClient;
    next();
}

shelly2Router.get('/', async (req, res) => {
    const shellyClient = require('../../../../../utils/getShellyClient');
    let devices = [];
    Object.values(shellyClient.devices).forEach(device => {
        if (device._type == -2) {
            devices.push(shellyClient.getUsableShellyObject(device));
        }
    });
    res.status(200).json(devices);
});

shelly2Router.get('/:deviceId', getDevice, async (req, res) => {
    res.status(200).json(req.shellyClient.getUsableShellyObject(req.device));
});

shelly2Router.post('/:deviceId/operate/roller', getDevice, async (req, res) => {
    let { action, position } = req.body;
    if (req.device.profile != 'cover') {
        return res.status(400).json({
            message: 'This device is not a roller!'
        });
    }
    if (action == 'position') {
        req.device.cover0.goToPosition(parseInt(position) + 10 > 100 ? 100 : parseInt(position) + 10);
    } else if (action == 'close') {
        req.device.cover0.close();
    } else if (action == 'stop') {
        req.device.cover0.stop();
    } else if (action == 'open') {
        req.device.cover0.open();
    }
    res.status(200);
});

shelly2Router.post('/:deviceId/operate/switch', getDevice, async (req, res) => {
    let { relay, value } = req.body;
    if (req.device.profile != 'switch') {
        return res.status(400).json({
            message: 'This device is not a switch!'
        });
    }
    req.device[relay].set(value);
    res.status(200);
});

module.exports = shelly2Router;