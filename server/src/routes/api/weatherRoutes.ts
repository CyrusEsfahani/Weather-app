import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


router.post('/', (req: Request, res: Response) => {
  const cityName = req.body.cityName;
  WeatherService.getWeatherForCity(cityName).then(data => {
    HistoryService.addCity(cityName);
    res.json(data);
  }
  )
});


router.get('/history', async (_req: Request, res: Response) => {
  const cities = await HistoryService.getCities();
  res.json(cities);
});


router.delete('/history/:id', async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({ message: "City id is required" });
  }
  HistoryService.removeCity(req.params.id).then(() => res.json({ sucess: `City with id ${req.params.id} has been deleted` })); 

});

export default router;
