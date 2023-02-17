import dotenv from 'dotenv';
dotenv.config({ path: 'config.env' });

import mongoose from 'mongoose';
import SeedData from './helpers/seed-data';

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/RouteTracker';
mongoose.connect(mongodbUri);
mongoose.connection.once('connected', async () => {
  console.log('Database connected');
  await SeedData();
});
mongoose.connection.on('error', (error) => {
    console.error(error);
});
mongoose.set('strictQuery', true);

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import strongErrorHandler from 'strong-error-handler';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(strongErrorHandler({ debug: true }));

import DestinationRouter from './routers/destination-router';
import GeneralRouter from './routers/general-router';
import RouteRouter from './routers/route-router';
import StatusRouter from './routers/status-router';
import TypeRouter from './routers/type-router';
import UserRouter from './routers/user-router';
app.use('/api', [DestinationRouter, GeneralRouter, RouteRouter, StatusRouter, TypeRouter, UserRouter]);

const port = process.env.SERVER_PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on : http://localhost:${port}`);
});