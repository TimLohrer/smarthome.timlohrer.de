require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config/config.json');
const { MdnsDeviceDiscoverer } = require('shellies-ng');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

let tradfriClient;
let shellyClient;

// const { TradfriClient, Accessory } = require('node-tradfri-client');
// const client = new TradfriClient();
// client.operateLight()

const api = express();
api.use(cors({ origin: ['https://smarthome.timlohrer.de'] }));
api.use(express.json());
api.use(express.urlencoded({ extended: false }));
api.disable('x-powered-by');

const server = createServer(api);
const wss = new WebSocketServer({ server: server });

api.use('/api', require('./routes/api/apiRouter'));
api.get('/*', (req, res) => {
    res.sendStatus(404);
});

server.listen(config.ports.API, async () => {
    tradfriClient = await require('./utils/getGateway')();
    console.log('Loaded all Tradfri data.');
    tradfriClient.on('device updated', device => wss.clients.forEach(client => {
        delete device.client;
        client.send(JSON.stringify({ type: 'device updated', device: device }));
    }));

    const shellies = require('./utils/getShellyClient');
    const discoverer = new MdnsDeviceDiscoverer();
    shellies.registerDiscoverer(discoverer);
    discoverer.start();
    console.log(`Api and WSS live on port ${config.ports.API}!`);
});


const buildClientComponents = require('./utils/buildClientComponents');
const build = require('./utils/build');
const app = express();
app.disable('x-powered-by');

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.send(build('index', { title: 'SmartHome' })));
app.get('/*', (req, res) => res.send('<h1>404 - Not found!</h1><script>setTimeout(() => { window.open("/", "_self") }, 3000);</script>'))

app.listen(config.ports.APP, () => {
    buildClientComponents(config.url);
    console.log(`App live on port ${config.ports.APP}!`);
});

module.exports = wss;