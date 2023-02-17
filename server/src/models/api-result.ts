import moment from "moment";

export default class APIResult {

  data: any
  success: boolean = true
  message: string = ''

  public static error(message: string): APIResult {
    const res = new APIResult();
    res.success = false;
    res.message = message;
    return res;
  }
  
  public static ok(data?: any): APIResult {
    const res = new APIResult();
    res.data = this.transformDate(data);
    return res;
  }

  static transformDate(data: any | any[]) {
    if(data) {
      if(Array.isArray(data)) {
        const updatedDatas: any[] = [];
        for (let i = 0; i < data.length; i++) {
          updatedDatas.push(this.transformDateInObject(data[i]));
        }
        data = updatedDatas;
      }
      else
        data = this.transformDateInObject(data);
    }
    return data;
  }

  static transformDateInObject(data: any) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = data[key];
        if(val && this.validDate(val))
          data[key] = moment.utc(val).local().format();
        // if(typeof val === 'object')
        //   data[key] = this.transformDate(val);
        // else {
          
        // }
      }
    }
    return data;
  }

  static validDate(date: any) {
    // console.log(date + ' ' + typeof date + ' ' + isNaN(new Date(date).getDate()))
    return typeof date === 'object' && !isNaN(new Date(date).getDate());
  }
  
}