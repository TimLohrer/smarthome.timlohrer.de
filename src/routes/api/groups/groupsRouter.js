const { Router } = require('express');
const { shellyGroups } = require('../../../config/config.json');
const groupsRouter = Router();

const getGroup = async (req, res, next) => {
    const { groupId } = req.params;
    const tradfriClient = await require('../../../utils/getGateway')();
    if (!Object.keys(tradfriClient.groups).includes(groupId)) {
        return res.status(400).json({
            message: 'Group does not exist!'
        });
    }
    req.group = tradfriClient.groups[groupId];
    req.tradfriClient = tradfriClient;
    next();
}

groupsRouter.get('/', async (req, res) => {
    const tradfriClient = await require('../../../utils/getGateway')();
    let groups = [];
    shellyGroups.forEach(group => {
        let _devices = [];
        group.devices.forEach(d => {
            _devices.push(d);
        });
        Object.values(tradfriClient.groups).find(g => g.group.instanceId == group.instanceId)?.group.deviceIDs.forEach(d => {
            _devices.push(d.toString());
        });
        groups.push({
            name         : group.name,
            instanceId   : group.instanceId,
            toggleDevices: group.toggleDevices,
            devices      : _devices
        });
    });
    res.status(200).json(groups);
});

groupsRouter.get('/superGroup', async (req, res) => {
    const tradfriClient = await require('../../../utils/getGateway')();
    let group = Object.values(tradfriClient.groups).find(g => g.group.groupType == 2);
    if (!group) {
        return res.status(400).json({
            message: 'SuperGroup not found!'
        });
    }
    res.status(200).json(group);
});

groupsRouter.get('/:groupId', getGroup, async (req, res) => {
    res.status(200).json(req.group);
});

groupsRouter.post('/:groupId/update', getGroup, async (req, res) => {
    const tradfriClient = req.tradfriClient;
    let group = req.group;
    const { name } = req.body;
    group.group.name = name ? name : group.group.name;
    try {
        await tradfriClient.updateGroup(group.group);
        res.status(200).json(group);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            message: e
        });
    }
});

groupsRouter.post('/:groupId/operate', getGroup, async (req, res) => {
    const tradfriClient = req.tradfriClient;
    let group = req.group;
    const { onOff, dimmer, sceneId, transitionTime } = req.body;
    try {
        await tradfriClient.operateGroup(
            group.group,
            {
                onOff: onOff,
                dimmer: parseInt(dimmer),
                sceneId: parseInt(sceneId),
                transitionTime: parseInt(transitionTime)
            },
            true
        );
        group.group.onOff = onOff ? onOff : group.group.onOff;
        group.group.dimmer = dimmer ? parseInt(dimmer) : group.group.dimmer;
        group.group.sceneId = sceneId ? parseInt(sceneId) : group.group.sceneId;
        group.group.transitionTime = transitionTime ? parseInt(transitionTime) : group.group.transitionTime;
        res.status(200).json(group);
    } catch (e) {
        console.error(e);
        res.status(400).json({
            message: e
        });
    }
});

module.exports = groupsRouter;