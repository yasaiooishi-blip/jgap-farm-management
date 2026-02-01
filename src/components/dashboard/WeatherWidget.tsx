import { useState, useEffect } from 'react';
import Card from '../common/Card';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  precipitation: number;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: '晴れ',
    humidity: 65,
    precipitation: 0,
    icon: 'wb_sunny'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 実際のAPIと連携する場合はここで取得
    // 今はダミーデータを使用
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getWeatherAdvice = () => {
    if (weather.precipitation > 50) {
      return '降水確率が高いため、屋外作業は避けることをお勧めします。';
    }
    if (weather.temperature > 30) {
      return '気温が高いため、こまめな水分補給と休憩を心がけてください。';
    }
    if (weather.temperature < 10) {
      return '気温が低いため、防寒対策を行ってください。';
    }
    return '本日は作業に適した天候です。';
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">今日の天気</h3>
        <span className="material-icons text-yellow-500 text-4xl">{weather.icon}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">気温</span>
            <span className="material-icons text-blue-600 text-xl">thermostat</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{weather.temperature}°C</p>
        </div>
        
        <div className="bg-cyan-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">湿度</span>
            <span className="material-icons text-cyan-600 text-xl">water_drop</span>
          </div>
          <p className="text-2xl font-bold text-cyan-600">{weather.humidity}%</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">降水確率</span>
            <span className="material-icons text-purple-600 text-xl">umbrella</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{weather.precipitation}%</p>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
        <div className="flex items-start">
          <span className="material-icons text-green-600 mr-2">lightbulb</span>
          <p className="text-sm text-gray-700">{getWeatherAdvice()}</p>
        </div>
      </div>
    </Card>
  );
}
