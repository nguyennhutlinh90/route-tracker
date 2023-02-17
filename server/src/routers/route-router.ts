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

RouteRouter.route('/route').get(async (req, res) => {
  try {
    // Remove after login
    const admin = await UserModel.findOne({ username: 'admin' });
    if(!admin)
      throw `User 'admin' was not found`;
    
      const routes = await RouteModel.aggregate([
        {
          $match: {
            $and: [
              { user_id: new Types.ObjectId(admin.id) },
              {
                $or: [
                  { state: null },
                  { state: State.ACTIVE },
                  // {
                  //   $and: [
                  //     { state: { $in: [State.CANCEL, State.FINISH] } },
                  //     { is_unique: false }
                  //   ]
                  // }
                ]
              }  
            ]
          }
        },
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
        { $addFields: { id: '$_id', destination_name: { $first: '$destinations.name' }, type_name: { $first: '$types.name' }, spent_time: { $subtract: ['$end_time', '$start_time'] } } },
        { $project: { _id: 0, __v: 0, user_id: 0, destinations: 0, types: 0 } }
      ]);

    res.json(APIResult.ok(routes));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

RouteRouter.route("/route").post(async (req, res) => {
  try {
    if(!req.body || !req.body.destination_id)
      throw 'Destination ID is required';
    
    // Remove after login
    const admin = await UserModel.findOne({ username: 'admin' });
    if(!admin)
      throw `User 'admin' was not found`;
  
    const destination = await DestinationModel.findOne({ _id: req.body.destination_id });
    if(!destination)
      throw 'Destination was not found';

    if(req.body.type_id) {
      const type = await TypeModel.findOne({ _id: req.body.type_id });
      if(!type)
        throw 'Type was not found';
    }

    const existedRoute = await RouteModel.findOne({ user_id: admin.id, destination_id: req.body.destination_id, state: State.ACTIVE });
    if(existedRoute)
      throw 'This destination is activated, can not create route';
  
    const newRoute = new RouteModel(req.body);
    newRoute.user_id = admin.id;
    await newRoute.save();

    res.json(APIResult.ok(newRoute.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

RouteRouter.route("/route/create_many").post(async (req, res) => {
  try {
    if(!req.body)
      throw 'Destination ID(s) is required';
    
    // Remove after login
    const admin = await UserModel.findOne({ username: 'admin' });
    if(!admin)
      throw `User 'admin' was not found`;

    const newRoutes: any[] = [];
    const reqRoutes = Array.isArray(req.body) ? req.body : (req.body ? [req.body] : []);
    for (let i = 0; i < reqRoutes.length; i++) {
      const reqRoute = reqRoutes[i];

      if(!reqRoute.destination_id)
        throw 'Destination ID(s) is required';

      const reqRouteDupplicateds = reqRoutes.filter(r => r.destination_id === reqRoute.destination_id)
      if(reqRouteDupplicateds.length > 1)
        throw `Destination ID '${reqRoute.destination_id}' is dupplicated in list`;

      const destination = await DestinationModel.findOne({ _id: reqRoute.destination_id });
      if(!destination)
        throw `Destination ID '${reqRoute.destination_id}' was not found`;

      if(reqRoute.type_id) {
        const type = await TypeModel.findOne({ _id: reqRoute.type_id });
        if(!type)
          throw `Type ID '${reqRoute.destination_id}' was not found`;
      }

      const existedRoute = await RouteModel.findOne({ user_id: admin.id, destination_id: destination.id, state: State.ACTIVE });
      if(existedRoute)
        throw `Destination '${destination.name}' is activated a route, can not create new route`;
    
      const newRoute = new RouteModel(reqRoute);
      newRoute.user_id = admin.id;
      newRoutes.push(newRoute);
    }

    await RouteModel.insertMany(newRoutes)
    
    res.json(APIResult.ok(newRoutes));
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
      if(req.body.state && req.body.state !== route.state)
        route.state = req.body.state;
      if(req.body.start_time)
        route.start_time = req.body.start_time;
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