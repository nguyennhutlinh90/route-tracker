import express from 'express';
import APIResult from '../models/api-result';
import DestinationModel from '../models/destination-model';
import { State } from '../models/enums';
import RouteModel from '../models/route-model';
import RouteHistoryModel from '../models/route-history-model';
import StatusModel from '../models/status-model';
import TypeModel from '../models/type-model';
import UserModel from '../models/user-model';
import { Types } from 'mongoose';

const RouteRouter = express.Router();

RouteRouter.route("/route").post(async (req, res) => {
  try {
    if(!req.body || !req.body.destination_id)
      throw 'Destination ID is required';
    
    if(!req.body.type_id)
      throw 'Type ID is required';

    // Remove after login
    const admin = await UserModel.findOne({ username: 'admin' });
    if(!admin)
      throw `User 'admin' was not found`;
  
    const destination = await DestinationModel.findOne({ _id: req.body.destination_id });
    if(!destination)
      throw 'Destination was not found';

    const type = await TypeModel.findOne({ _id: req.body.type_id });
    if(!type)
      throw 'Type was not found';

    const existedRoute = await RouteModel.findOne({ user_id: admin.id, destination_id: req.body.destination_id, state: State.ACTIVE });
    if(existedRoute)
      throw 'This destination is activated, can not create route';
  
    const newRoute = new RouteModel(req.body);
    newRoute.user_id = admin.id;
    newRoute.state = State.ACTIVE;
    await newRoute.save();

    res.json(APIResult.ok(newRoute.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

RouteRouter.route("/route/:id").put(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Route ID is required';

    const route = await RouteModel.findOne({ _id: req.params.id });
    if(!route)
      throw 'Route was not found';

    if(req.body) {
      if(req.body.type_id && req.body.type_id !== route.type_id)
        route.type_id = req.body.type_id;
      if(req.body.is_system !== undefined && req.body.is_system !== null)
        route.is_system = req.body.is_system;
      if(req.body.is_unique !== undefined && req.body.is_unique !== null)
        route.is_unique = req.body.is_unique;
      if(req.body.state && req.body.state !== route.state)
        route.state = req.body.state;
      if(req.body.end_time)
        route.end_time = req.body.end_time;
    }

    await RouteModel.updateOne( { _id: req.params.id }, route);

    res.json(APIResult.ok(route.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});
 
RouteRouter.route('/route/:id').get(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Route ID is required';

    const routes = await RouteModel.aggregate([
      { $match: { _id: new Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'destinations',
          localField: 'destination_id',
          foreignField: '_id',
          as: 'destinations'
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
     {
      $lookup: {
        from: 'route_histories',
        localField: '_id',
        foreignField: 'route_id',
        as: 'histories',
        pipeline: [
          { 
            $lookup: {
              from: 'status',
              localField: 'status_id',
              foreignField: '_id',
              as: 'statuses'
            }
          },
          { $addFields: { id: '$_id', status_name: { $first: '$statuses.name' }, spent_time: { $subtract: ['$end_time', '$start_time'] } } },
          { $project: { _id: 0, __v: 0, route_id: 0, statuses: 0 } }
        ]
      }
    },
     { $addFields: { id: '$_id', destination_name: { $first: '$destinations.name' }, type_name: { $first: '$types.name' }, spent_time: { $subtract: ['$end_time', '$start_time'] } } },
     { $project: { _id: 0, __v: 0, user_id: 0, destinations: 0, types: 0 } }
    ]);
    if(!routes || routes.length <= 0)
      throw 'Route was not found';

    res.json(APIResult.ok(routes[0]));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

RouteRouter.route("/route/:id/add_status/:status_id").post(async (req, res) => {
  try {
    if(!req.params || !req.params.id)
      throw 'Route ID is required';
    
    if(!req.params.status_id)
      throw 'Status ID is required';

    const route = await RouteModel.findOne({ _id: req.params.id });
    if(!route)
      throw 'Route was not found';

    const status = await StatusModel.findOne({ _id: req.params.status_id });
    if(!status)
      throw 'Status was not found';

    route.end_time = new Date();
    await RouteModel.updateOne( { _id: route.id }, route);

    const latestRouteHistory = await RouteHistoryModel.findOne({ route_id: req.params.id }).sort({ start_time: -1 });
    if(latestRouteHistory) {
      latestRouteHistory.end_time = new Date();
      await RouteHistoryModel.updateOne( { _id: latestRouteHistory.id }, latestRouteHistory);
    }

    const newRouteHistory = new RouteHistoryModel();
    newRouteHistory.route_id = route.id;
    newRouteHistory.status_id = status.id;
    await newRouteHistory.save();

    res.json(APIResult.ok(newRouteHistory.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

export default RouteRouter;