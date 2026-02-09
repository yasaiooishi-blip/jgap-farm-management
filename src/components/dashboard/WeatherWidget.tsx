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
    // 現在の日付と時刻に基づいたリアルな天気データを生成
    const generateWeatherData = () => {
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      const hour = now.getHours();
      
      // 季節ごとの基準温度
      let baseTemp = 20;
      if (month >= 12 || month <= 2) baseTemp = 8;  // 冬
      else if (month >= 3 && month <= 5) baseTemp = 18; // 春
      else if (month >= 6 && month <= 8) baseTemp = 28; // 夏
      else baseTemp = 20; // 秋
      
      // 時間帯による温度補正
      let tempAdjust = 0;
      if (hour >= 6 && hour < 12) tempAdjust = -3; // 朝
      else if (hour >= 12 && hour < 15) tempAdjust = 3; // 昼
      else if (hour >= 15 && hour < 18) tempAdjust = 1; // 午後
      else tempAdjust = -5; // 夜
      
      const temperature = Math.round(baseTemp + tempAdjust + (Math.random() * 4 - 2));
      
      // 天候パターン（80%晴れ、15%曇り、5%雨）
      const weatherRandom = Math.random();
      let condition = '晴れ';
      let icon = 'wb_sunny';
      let precipitation = Math.floor(Math.random() * 20);
      let humidity = 50 + Math.floor(Math.random() * 30);
      
      if (weatherRandom > 0.95) {
        condition = '雨';
        icon = 'rainy';
        precipitation = 60 + Math.floor(Math.random() * 40);
        humidity = 70 + Math.floor(Math.random() * 25);
      } else if (weatherRandom > 0.80) {
        condition = '曇り';
        icon = 'cloud';
        precipitation = 20 + Math.floor(Math.random() * 30);
        humidity = 60 + Math.floor(Math.random() * 30);
      }
      
      return {
        temperature,
        condition,
        humidity,
        precipitation,
        icon
      };
    };

    setTimeout(() => {
      setWeather(generateWeatherData());
      setLoading(false);
    }, 500);
  }, []);

  const getWeatherAdvice = () => {
    if (weather.precipitation > 60) {
      return '⚠️ 降水確率が高いため、屋外作業は避けることをお勧めします。農薬散布は延期してください。';
    }
    if (weather.precipitation > 40) {
      return '⚠️ 雨の可能性があります。作業計画の変更を検討してください。';
    }
    if (weather.temperature > 30) {
      return '🌡️ 気温が高いため、こまめな水分補給と休憩を心がけてください。熱中症に注意！';
    }
    if (weather.temperature < 5) {
      return '❄️ 気温が低いため、防寒対策を十分に行ってください。';
    }
    if (weather.temperature < 10) {
      return '🧥 気温が低めです。防寒対策を行ってください。';
    }
    return '✅ 本日は作業に適した天候です。農作業日和ですね！';
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

      <div className={`border-l-4 p-3 rounded ${
        weather.precipitation > 60 || weather.temperature > 30 || weather.temperature < 5
          ? 'bg-red-50 border-red-500'
          : weather.precipitation > 40 || weather.temperature < 10
          ? 'bg-yellow-50 border-yellow-500'
          : 'bg-green-50 border-green-500'
      }`}>
        <div className="flex items-start">
          <span className={`material-icons mr-2 ${
            weather.precipitation > 60 || weather.temperature > 30 || weather.temperature < 5
              ? 'text-red-600'
              : weather.precipitation > 40 || weather.temperature < 10
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}>
            {weather.precipitation > 60 || weather.temperature > 30 || weather.temperature < 5
              ? 'warning'
              : 'lightbulb'}
          </span>
          <p className="text-sm text-gray-700">{getWeatherAdvice()}</p>
        </div>
      </div>
    </Card>
  );
}
