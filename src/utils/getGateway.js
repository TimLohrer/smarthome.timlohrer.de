const { discoverGateway, TradfriClient } = require('node-tradfri-client');
let tradfriClient;

module.exports = async function getGateway() {
    if (!tradfriClient) {
        try {
            const gateway = await discoverGateway(false);
            tradfriClient = new TradfriClient(gateway.host);
            const { identity, psk } = await tradfriClient.authenticate(process.env.GATEWAY_PASSWORD.toString());
            tradfriClient.connect(identity, psk);
            await tradfriClient.observeGateway();
            await tradfriClient.observeGroupsAndScenes();
            await tradfriClient.observeDevices();
            await tradfriClient.observeNotifications();
            return tradfriClient;
        } catch (e) {
            console.error(e);
            process.exit();
        }
    } else {
        return tradfriClient;
    }
}