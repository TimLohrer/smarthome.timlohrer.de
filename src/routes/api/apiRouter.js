const { Router } = require('express');
const apiRouter = Router();

apiRouter.use('/groups', require('./groups/groupsRouter'));
apiRouter.use('/devices', require('./devices/devicesRouter'));

module.exports = apiRouter;