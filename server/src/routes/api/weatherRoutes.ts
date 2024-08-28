import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  const cityName = req.body.cityName;
  WeatherService.getWeatherForCity(cityName).then(data => {
    HistoryService.addCity(cityName);
    res.json(data);
  }
  )
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  const cities = await HistoryService.getCities();
  res.json(cities);
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  
  res.json({ message: `City with id ${id} has been deleted` });
});

export default router;
