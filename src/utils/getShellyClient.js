const wss = require('../app');
const { Shellies, Device, ShellyPlus2Pm } = require('shellies-ng');

const shellies = new Shellies();

shellies.getUsableShellyObject = require('./getUsableShellyObject');

shellies.on('add', async (device = Device) => {
    console.log(`${(await device.shelly.getDeviceInfo()).name} (${device.id.split('-')[1]}) -> ${device.wifi.sta_ip}`);
    shellies.get(device.id).name = (await device.shelly.getDeviceInfo()).name;
    shellies.get(device.id).config = await device.shelly.getConfig();
    // console.log(shellies.getUsableShellyObject(device));
    device.rpcHandler.on('statusUpdate', () => {
        wss.clients.forEach(async client => {
            client.send(JSON.stringify({ type: 'device updated', device: shellies.getUsableShellyObject(device) }))
        });
    })
});

shellies.on('error', (deviceId, error) => {
    console.error('An error occured:', error.message);
});

module.exports = shellies;