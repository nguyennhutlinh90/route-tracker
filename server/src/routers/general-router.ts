import express from 'express';

const GeneralRouter = express.Router();

GeneralRouter.route('/').get(async (req, res) => {
  var version = '1.0.0';
  var info = {
    product: "My Kingdom API",
    version: version,
    poweredBy: "Delfi Technologies A/S"
  };
  var logs = [
    {
      version: version,
      issues: ['Start up']
    },
    {
      version: '1.0.1',
      issues: ['Start up 1']
    },
    {
      version: '1.0.2',
      issues: ['Start up 2']
    }
  ];
  res.json({ info: info, logs: logs.sort((a, b) => b.version.localeCompare(a.version)) });
});

export default GeneralRouter;