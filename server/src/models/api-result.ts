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
    res.data = data;
    return res;
  }
  
}