import {wait} from '@augment-vir/common';
import {log} from '@augment-vir/node-js';
import {backendPortNumber, backendRequestWaitDuration} from '@electrovir/common';
import cors, {CorsOptions} from 'cors';
import express from 'express';

const expressApp = express();

const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (origin?.startsWith('localhost:')) {
            callback(null);
        }
    },
};

expressApp.use(cors());

expressApp.use((req, _res, next) => {
    log.info(`[${req.method}]: ${req.path}`);
    next();
});

expressApp.get('/', async (req, res) => {
    await wait(backendRequestWaitDuration);
    res.send('hello');
});

const server = expressApp.listen(backendPortNumber, () => {
    console.log('Server started');
});
