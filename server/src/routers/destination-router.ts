import express from 'express';
import { Types } from 'mongoose';
import APIResult from '../models/api-result';
import DestinationModel from '../models/destination-model';
import { State } from '../models/enums';
import UserModel from '../models/user-model';

const DestinationRouter = express.Router();

DestinationRouter.route('/destination').get(async (req, res) => {
  try {
    // Remove after login
    const admin = await UserModel.findOne({ username: 'admin' });
    if(!admin)
      throw `User 'admin' was not found`;
    
    const destinations = await DestinationModel.aggregate([
      {
        $lookup: {
          from: 'routes',
          localField: '_id',
          foreignField: 'destination_id',
          as: 'routes',
          pipeline: [
            { 
              $match: {
                user_id: new Types.ObjectId(admin.id),
                state: State.ACTIVE
              }
            },
            { 
              $lookup: {
                from: 'types',
                localField: 'type_id',
                foreignField: '_id',
                as: 'types'
              }
            },
            { $addFields: { id: '$_id', type_name: { $first: '$types.name' }, spent_time: { $subtract: ['$end_time', '$start_time'] } } },
            { $project: { _id: 0, __v: 0, destination_id: 0, user_id: 0, types: 0 } }
          ]
        }
      },
      { $addFields: { id: '$_id', active_route: { $first: '$routes' } } },
      { $project: { _id: 0, __v: 0, routes: 0 } }
    ]);

    res.json(APIResult.ok(destinations));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

DestinationRouter.route("/destination").post(async (req, res) => {
  try {
    if(!req.body || !req.body.name)
      throw 'Destination name is required';
  
    const existedRoute = await DestinationModel.findOne({ name: req.body.name });
    if(existedRoute)
      throw 'Destination name is already in use';

    if(!req.body.description)
      req.body.description = req.body.name;

    const newRoute = new DestinationModel(req.body);
    await newRoute.save();

    res.json(APIResult.ok(newRoute.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

DestinationRouter.route("/destination/:id").put(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Destination ID is required';

    const route = await DestinationModel.findOne({ _id: req.params.id });
    if(!route)
      throw 'Destination was not found';

    if(req.body) {
      if(req.body.name && req.body.name !== route.name) {
        const existedRoute = await DestinationModel.findOne({ name: req.body.name });
        if(existedRoute)
          throw 'Destination name is already in use';
        route.name = req.body.name;
      }
      if(req.body.description)
        route.description = req.body.description;
      route.updated_at = new Date();
    }

    await DestinationModel.updateOne( { _id: req.params.id }, route);

    res.json(APIResult.ok(route.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});
 
DestinationRouter.route("/destination/:id").delete(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Destination ID is required';

    const route = await DestinationModel.findOne({ _id: req.params.id });
    if(!route)
      throw 'Destination was not found';

    await DestinationModel.deleteOne({ _id: req.params.id });
    
    res.json(APIResult.ok());

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});
 
DestinationRouter.route('/destination/:id').get(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Destination ID is required';
  
    const route = await DestinationModel.findOne({ _id: req.params.id });
    if(!route)
      throw 'Destination was not found';

    res.json(APIResult.ok(route.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

export default DestinationRouter;