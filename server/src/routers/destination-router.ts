import express from 'express';
import { Types } from 'mongoose';
import APIResult from '../models/api-result';
import DestinationModel from '../models/destination-model';
import { State } from '../models/enums';
import UserModel from '../models/user-model';
import TypeModel from '../models/type-model';

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
      { 
        $lookup: {
          from: 'types',
          localField: 'type_id',
          foreignField: '_id',
          as: 'types'
        }
      },
      { $addFields: { id: '$_id', type_name: { $first: '$types.name' }, active_route: { $first: '$routes' } } },
      { $project: { _id: 0, __v: 0, types: 0, routes: 0 } }

      // { $addFields: { id: '$_id' } },
      // { $project: { _id: 0, __v: 0 } }
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

    if(req.body.type_id) {
      const type = await TypeModel.findOne({ _id: req.body.type_id });
      if(!type)
        throw 'Type was not found';
    }
  
    const existedDestination = await DestinationModel.findOne({ name: req.body.name });
    if(existedDestination)
      throw 'Destination name is already in use';

    if(!req.body.description)
      req.body.description = req.body.name;

    const newDestination = new DestinationModel(req.body);
    await newDestination.save();

    res.json(APIResult.ok(newDestination.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

DestinationRouter.route("/destination/:id").put(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Destination ID is required';

    const destination = await DestinationModel.findOne({ _id: req.params.id });
    if(!destination)
      throw 'Destination was not found';

    if(req.body) {
      if(req.body.name && req.body.name !== destination.name) {
        const existedRoute = await DestinationModel.findOne({ name: req.body.name });
        if(existedRoute)
          throw 'Destination name is already in use';
        destination.name = req.body.name;
      }
      if(req.body.type_id && req.body.type_id !== destination.type_id) {
        const type = await TypeModel.findOne({ _id: req.body.type_id });
        if(!type)
          throw 'Type was not found';
        destination.type_id = req.body.type_id;
      }
      if(req.body.is_system !== undefined && req.body.is_system !== null)
        destination.is_system = req.body.is_system;
      if(req.body.is_unique !== undefined && req.body.is_unique !== null)
        destination.is_unique = req.body.is_unique;
      if(req.body.description)
        destination.description = req.body.description;
      destination.updated_at = new Date();
    }

    await DestinationModel.updateOne( { _id: req.params.id }, destination);

    res.json(APIResult.ok(destination.toJSON()));

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