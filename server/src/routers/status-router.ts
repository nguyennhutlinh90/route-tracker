import express from 'express';
import APIResult from '../models/api-result';
import StatusModel from '../models/status-model';

const StatusRouter = express.Router();

StatusRouter.route('/status').get(async (req, res) => {
  try {
    const statuses = await StatusModel.aggregate([
      { $addFields: { id: '$_id' } },
      { $project: { _id: 0, __v: 0 } }
    ]);
    res.json(APIResult.ok(statuses));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

StatusRouter.route("/status").post(async (req, res) => {
  try {
    if(!req.body || !req.body.name)
      throw 'Status name is required';

    const existedStatus = await StatusModel.findOne({ name: req.body.name });
    if(existedStatus)
      throw 'Status name is already in use';
  
    const newStatus = new StatusModel(req.body);
    await newStatus.save();

    res.json(APIResult.ok(newStatus.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

export default StatusRouter;