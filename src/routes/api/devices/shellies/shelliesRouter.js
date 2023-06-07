const { Router } = require('express');
const shelliesRouter = Router();

shelliesRouter.use('/1', require('./1/1Router'));
shelliesRouter.use('/2', require('./2/2Router'));

shelliesRouter.get('/', async (req, res) => {
    const shellyClient = require('../../../../utils/getShellyClient');
    let devices = [];
    shellyClient.forEach(device => {
        devices.push(shellyClient.getUsableShellyObject(device));
    });
    res.status(200).json(devices);
});

module.exports = shelliesRouter;