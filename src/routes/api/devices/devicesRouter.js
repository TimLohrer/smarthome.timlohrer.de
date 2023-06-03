const { Router } = require('express');
const devicesRouter = Router();

devicesRouter.use('/remotes', require('./remotes/remotesRouter'));
devicesRouter.use('/lights', require('./lights/lightsRouter'));
devicesRouter.use('/plugs', require('./plugs/plugsRouter'));
devicesRouter.use('/shellies', require('./shellies/shelliesRouter'));

devicesRouter.get('/', async (req, res) => {
    const tradfriClient = await require('../../../utils/getGateway')();
    const shellyClient = require('../../../utils/getShellyClient');
    let devices = Object.values(tradfriClient.devices);
    shellyClient.forEach(device => {
        devices.push(shellyClient.getUsableShellyObject(device));
    });
    res.status(200).json(devices);
});

module.exports = devicesRouter;