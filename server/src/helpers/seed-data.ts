import bcryptJS from 'bcryptjs';
import RouteStatusModel from '../models/status-model';
import RouteTypeModel from '../models/type-model';
import UserModel from '../models/user-model';

export default async () => {
  try {
    console.log('Seed route type data');
    let ingoingType = await RouteTypeModel.findOne({ name: 'Ingoing' });
    if(!ingoingType) {
      ingoingType = new RouteTypeModel({ name: 'Ingoing' });
      await ingoingType.save();
    }
    let outgoingType = await RouteTypeModel.findOne({ name: 'Outgoing' });
    if(!outgoingType) {
      outgoingType = new RouteTypeModel({ name: 'Outgoing' });
      await outgoingType.save();
    }
    console.log('=> Seed route type data successful!');

    console.log('Seed route status data');
    let awaitPickupStatus = await RouteStatusModel.findOne({ name: 'Awaiting pickup' });
    if(!awaitPickupStatus) {
      awaitPickupStatus = new RouteStatusModel({ name: 'Awaiting pickup' });
      await awaitPickupStatus.save();
    }
    let arrivedStatus = await RouteStatusModel.findOne({ name: 'arrived' });
    if(!arrivedStatus) {
      arrivedStatus = new RouteStatusModel({ name: 'arrived' });
      await arrivedStatus.save();
    }
    let waitingForDeliveryStatus = await RouteStatusModel.findOne({ name: 'Waiting for delivery' });
    if(!waitingForDeliveryStatus) {
      waitingForDeliveryStatus = new RouteStatusModel({ name: 'Waiting for delivery' });
      await waitingForDeliveryStatus.save();
    }
    console.log('=> Seed route status data successful!');

    console.log('Seed user data');
    let admin = await UserModel.findOne({ name: 'admin' });
    if(!admin) {
      admin = new UserModel({
        username: 'admin',
        password: bcryptJS.hashSync('admin@123', 10),
        last_name: 'Admin',
        status: 'ACTIVE'
      });
      await admin.save();
    }
    console.log('=> Seed user data successful!');
  }
  catch (error) {
    console.error(error);
  }
};