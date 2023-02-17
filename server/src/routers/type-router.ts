import express from 'express';
import APIResult from '../models/api-result';
import TypeModel from '../models/type-model';

const TypeRouter = express.Router();

TypeRouter.route('/type').get(async (req, res) => {
  try {
    const types = await TypeModel.aggregate([
      { $addFields: { id: '$_id' } },
      { $project: { _id: 0, __v: 0 } }
    ]);
    res.json(APIResult.ok(types));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

TypeRouter.route("/type").post(async (req, res) => {
  try {
    if(!req.body || !req.body.name)
      throw 'Type name is required';

    const existedType = await TypeModel.findOne({ name: req.body.name });
    if(existedType)
      throw 'Type name is already in use';
  
    const newType = new TypeModel(req.body);
    await newType.save();

    res.json(APIResult.ok(newType.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

export default TypeRouter;