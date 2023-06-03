const { Router } = require('express');
const { ShellyPlus1Pm } = require('shellies-ng');
const shelly1Router = Router();

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

shelly1Router.get('/', async (req, res) => {
    const shellyClient = require('../../../../../utils/getShellyClient');
    let devices = [];
    Object.values(shellyClient.devices).forEach(device => {
        if (device.id.split('-')[0] == 'shellyplus1pm') {
            devices.push(shellyClient.getUsableShellyObject(device));
        }
    });
    res.status(200).json(devices);
});

shelly1Router.get('/:deviceId', getDevice, async (req, res) => {
    res.status(200).json(req.shellyClient.getUsableShellyObject(req.device));
});

shelly1Router.post('/:deviceId/operate', getDevice, async (req, res) => {
    let { value } = req.body;
    await req.device.switch0.set(value);
    res.sendStatus(200);
});

module.exports = shelly1Router;