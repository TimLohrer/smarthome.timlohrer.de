const { Router } = require('express');
const apiRouter = Router();

apiRouter.use('/groups', require('./groups/groupsRouter'));
apiRouter.use('/devices', require('./devices/devicesRouter'));

apiRouter.get('/', (req, res) => res.sendStatus(200))

module.exports = apiRouter;