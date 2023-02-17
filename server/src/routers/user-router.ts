import bcryptJS from 'bcryptjs';
import express from 'express';
import APIResult from '../models/api-result';
import UserModel from '../models/user-model';

const UserRouter = express.Router();

UserRouter.route('/user').get(async (req, res) => {
  try {
    const users = await UserModel.aggregate([
      { $addFields: { id: '$_id' } },
      { $project: { _id: 0, __v: 0 } }
    ]);
    res.json(APIResult.ok(users));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

UserRouter.route("/user").post(async (req, res) => {
  try {
    if(!req.body || !req.body.username)
      throw 'Username is required';
    
    if(!req.body.password)
      throw 'Password is required';

    const existedUser = await UserModel.findOne({ username: req.body.username });
    if(existedUser)
      throw 'Username is already in use';
  
    if(!req.body.status)
      req.body.status = 'ACTIVE';

    const newUser = new UserModel(req.body);
    newUser.password = bcryptJS.hashSync(newUser.password);
    await newUser.save();

    res.json(APIResult.ok(newUser.toJSON()));
  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});
 
UserRouter.route('/user/:username').get(async (req, res) => {
  try {
    if(!req.params || !req.params.username)
      throw 'Username is required';
  
    const user = await UserModel.findOne({ username: req.params.username });
    if(!user)
      throw 'User was not found';

    res.json(APIResult.ok(user.toJSON()));

  } catch (err: any) {
    res.json(APIResult.error(err));
  }
});

export default UserRouter;