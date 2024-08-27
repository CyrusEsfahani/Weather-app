import dotenv from 'dotenv';
import dayjs, { type Dayjs } from 'dayjs';
import { response } from 'express';
dotenv.config();

interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}


class Weather {
  constructor(
    public city: string,
    public date: Dayjs | string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
    public icon: string,
    public iconDescription: string,
  ) { }
}



class WeatherService {

  private baseURL?: string;
  private apiKey?: string;
  private city = ""

  constructur() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";
  }

  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error("Invalid API URL or Key");
      }
      const response: Coordinates[] = await fetch(query).then((res) => res.json());
      return response[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error("Invalid Location Data");
    }
    const { name, lat, lon, country, state } = locationData;

    const coordinates: Coordinates = {
      name,
      lat,
      lon,
      country,
      state,
    };
    return coordinates;
  }


  private buildGeocodeQuery(): string {
    const geocodeQuery = `${this.baseURL}geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
    return geocodeQuery;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `${this.baseURL}data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
  }

  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((locationData) => this.destructureLocationData(locationData));
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(response => response.json());
      if (!response) {
        throw new Error("Invalid Weather Data");
      }
      const currentWeather: Weather = this.parseCurrentWeather(response.list[0]);
      const forecast: Weather[] = this.buildForecastArray(currentWeather, response.list);
      return forecast;

    } catch (error) {
      console.log(error)
      return error;

    }
  }

  private parseCurrentWeather(response: any) {
    const parsedDate = dayjs.unix(response.dt).format("MM/DD/YYYY");
    const currentWeather = new Weather(
      this.city,
      parsedDate,
      response.main.temp,
      response.wind.speed,
      response.main.humidity,
      response.weather[0].icon,
      response.weather[0].description || response.weather[0].main
    );
    return currentWeather;
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];
    const filteredWeatherData = weatherData.filter((data: any) => { data.dt_txt.includes("12:00:00") });

    for (const day of filteredWeatherData) {
      weatherForecast.push(new Weather(this.city, dayjs.unix(day.dt).format("MM/DD/YYYY"), day.main.temp, day.wind.speed, day.main.humidity, day.weather[0].icon, day.weather[0].description || day.weather[0].main));
    }
    return weatherForecast;
  }

  async getWeatherForCity(city: string) {
    try {
      this.city = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates) {
        this.city = coordinates.name;
        const weatherData = await this.fetchWeatherData(coordinates);
        return weatherData;
      }
      throw new Error("Invalid Coordinates");
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export default new WeatherService();
