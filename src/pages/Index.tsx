import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface RoutePoint {
  id: string;
  address: string;
  isFirst: boolean;
  isLast: boolean;
}

interface RouteCalculation {
  distanceForward: number;
  distanceReturn: number;
  totalDistance: number;
  days: number;
  nights: number;
  departureDate: string;
  arrivalDate: string;
  vehicleType: string;
  costs: {
    fuel: number;
    salary: number;
    depreciation: number;
    hotel: number;
    maintenance: number;
    dailyAllowance: number;
    services: number;
  };
  total: number;
  hasProblematicPoints: boolean;
  problematicPoint?: string;
}

export default function Index() {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [fromAddress, setFromAddress] = useState('Москва');
  const [toAddress, setToAddress] = useState('Санкт-Петербург');
  const [cargoWeight, setCargoWeight] = useState('15');
  const [isOneWay, setIsOneWay] = useState(false);
  const [services, setServices] = useState({
    loading: false,
    tenting: false,
    expediting: false,
    additionalPoint: false
  });
  const [calculation, setCalculation] = useState<RouteCalculation | null>(null);
  const [showOptimization, setShowOptimization] = useState(false);

  const addRoutePoint = () => {
    if (routePoints.length < 20) {
      setRoutePoints([...routePoints, { 
        id: Date.now().toString(), 
        address: '', 
        isFirst: false, 
        isLast: false 
      }]);
    }
  };

  const removeRoutePoint = (id: string) => {
    setRoutePoints(routePoints.filter(point => point.id !== id));
  };

  const updateRoutePoint = (id: string, field: keyof RoutePoint, value: any) => {
    setRoutePoints(routePoints.map(point => 
      point.id === id ? { ...point, [field]: value } : point
    ));
  };

  const getVehicleType = (weight: string): string => {
    const w = parseFloat(weight);
    if (w <= 3.5) return 'Газель (до 3.5т)';
    if (w <= 10) return 'МАН 10т';
    return 'Фура 20т';
  };

  const calculateRoute = () => {
    const hasProblematic = routePoints.some(p => p.address.toLowerCase().includes('сыктывкар'));
    
    const mockCalculation: RouteCalculation = {
      distanceForward: 1247,
      distanceReturn: isOneWay ? 0 : 1247,
      totalDistance: isOneWay ? 1247 : 2494,
      days: 3,
      nights: 2,
      departureDate: '24.07 в 08:00',
      arrivalDate: '26.07 в 18:30',
      vehicleType: getVehicleType(cargoWeight),
      costs: {
        fuel: hasProblematic ? 28065 : 23705,
        salary: 18000,
        depreciation: hasProblematic ? 7482 : 6235,
        hotel: 4000,
        maintenance: hasProblematic ? 4482 : 3741,
        dailyAllowance: 2800,
        services: (services.loading ? 5000 : 0) + 
                 (services.tenting ? 2500 : 0) + 
                 (services.expediting ? 8000 : 0) + 
                 (services.additionalPoint ? 3000 : 0)
      },
      total: 0,
      hasProblematicPoints: hasProblematic,
      problematicPoint: hasProblematic ? 'Сыктывкар' : undefined
    };

    mockCalculation.total = Object.values(mockCalculation.costs).reduce((sum, cost) => sum + cost, 0);
    setCalculation(mockCalculation);
    setShowOptimization(false);
  };

  const optimizeRoute = () => {
    if (calculation) {
      const optimized = { ...calculation };
      optimized.costs.fuel = 23705;
      optimized.costs.depreciation = 6235;
      optimized.costs.maintenance = 3741;
      optimized.totalDistance = 2247;
      optimized.total = Object.values(optimized.costs).reduce((sum, cost) => sum + cost, 0);
      optimized.hasProblematicPoints = false;
      optimized.problematicPoint = undefined;
      setCalculation(optimized);
      setShowOptimization(true);
    }
  };

  return (
    <div className="h-screen bg-gray-25 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Icon name="Truck" className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                LogiCalc
              </h1>
              <p className="text-xs text-gray-500 leading-none">
                Логистический калькулятор
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Icon name="User" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full max-w-[1600px] mx-auto">
        {/* Left Panel - Route Input */}
        <div className="w-80 bg-white border-r border-gray-100 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Route Points */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                Маршрут
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="from" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Откуда
                  </Label>
                  <Input
                    id="from"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    className="mt-1.5 border-0 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="to" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Куда
                  </Label>
                  <Input
                    id="to"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="mt-1.5 border-0 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Intermediate Points */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Промежуточные точки
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRoutePoint}
                  disabled={routePoints.length >= 20}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-7 px-2"
                >
                  <Icon name="Plus" size={12} className="mr-1" />
                  Добавить
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {routePoints.map((point, index) => (
                  <Card key={point.id} className="border-0 bg-gray-50 shadow-none rounded-lg">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-400 w-4 text-center">
                            {index + 1}
                          </span>
                          <Input
                            placeholder="Город или адрес"
                            value={point.address}
                            onChange={(e) => updateRoutePoint(point.id, 'address', e.target.value)}
                            className="border-0 bg-white text-sm h-8 rounded-md"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoutePoint(point.id)}
                            className="text-gray-400 hover:text-red-500 p-1 h-6 w-6 rounded-md"
                          >
                            <Icon name="X" size={10} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs pl-6">
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              id={`first-${point.id}`}
                              checked={point.isFirst}
                              onCheckedChange={(checked) => {
                                updateRoutePoint(point.id, 'isFirst', checked);
                                if (checked) {
                                  setRoutePoints(prev => prev.map(p => 
                                    p.id !== point.id ? { ...p, isLast: false } : p
                                  ));
                                }
                              }}
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`first-${point.id}`} className="text-gray-600 text-xs">
                              Первая
                            </Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              id={`last-${point.id}`}
                              checked={point.isLast}
                              onCheckedChange={(checked) => {
                                updateRoutePoint(point.id, 'isLast', checked);
                                if (checked) {
                                  setRoutePoints(prev => prev.map(p => 
                                    p.id !== point.id ? { ...p, isFirst: false } : p
                                  ));
                                }
                              }}
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`last-${point.id}`} className="text-gray-600 text-xs">
                              Последняя
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {routePoints.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                  <Icon name="MapPin" size={20} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Нет промежуточных точек</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addRoutePoint}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-2"
                  >
                    Добавить первую точку
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-gray-100" />

            {/* Route Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                Настройки
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oneWay"
                    checked={isOneWay}
                    onCheckedChange={(checked) => setIsOneWay(checked as boolean)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="oneWay" className="text-sm text-gray-700">
                    Только в одну сторону
                  </Label>
                </div>
              </div>
            </div>

            {/* Cargo Weight */}
            <div>
              <Label htmlFor="weight" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Вес груза (тонны)
              </Label>
              <Input
                id="weight"
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="mt-1.5 border-0 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-200 rounded-lg"
                min="0.1"
                step="0.1"
              />
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  {getVehicleType(cargoWeight)}
                </Badge>
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3 block">
                Дополнительные услуги
              </Label>
              <div className="space-y-2">
                {[
                  { key: 'loading', label: 'ПРР' },
                  { key: 'tenting', label: 'Растентовка' },
                  { key: 'expediting', label: 'Экспедиторские' },
                  { key: 'additionalPoint', label: 'Доп. точка' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={services[key as keyof typeof services]}
                      onCheckedChange={(checked) => 
                        setServices(prev => ({ ...prev, [key]: checked }))
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor={key} className="text-sm text-gray-700">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculateRoute}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium shadow-sm hover:shadow-md transition-all"
              disabled={!fromAddress || !toAddress}
            >
              <Icon name="Calculator" size={16} className="mr-2" />
              Рассчитать маршрут
            </Button>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 bg-gray-25 p-6">
          <Card className="h-full border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Карта маршрута
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Icon name="Maximize2" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div className="h-full relative">
                {/* Map iframe would go here */}
                <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 mx-auto">
                      <Icon name="Map" size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      GraphHopper карта
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      localhost:8989
                    </p>
                    
                    {calculation && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{fromAddress}</span>
                        </div>
                        {routePoints.map((point, index) => point.address && (
                          <div key={point.id} className="flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">{point.address}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{toAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Summary Overlay */}
                {calculation && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {calculation.totalDistance} км
                            </div>
                            <div className="text-sm text-gray-600">
                              {calculation.days} дня • {calculation.nights} ночи
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {calculation.total.toLocaleString()} ₽
                            </div>
                            <div className="text-sm text-gray-600">
                              Общая стоимость
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Route Details */}
        <div className="w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto">
          {calculation ? (
            <div className="space-y-6">
              {/* Distance Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-3">
                  Километраж
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Туда</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {calculation.distanceForward}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">
                      {isOneWay ? 'Только туда' : 'Обратно'}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {calculation.distanceReturn}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-3">
                  Время в пути
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Дней</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {calculation.days}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Ночей</div>
                    <div className="text-lg font-semibold text-indigo-600">
                      {calculation.nights}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-3">
                  Транспорт
                </h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                  {calculation.vehicleType}
                </Badge>
              </div>

              <Separator className="bg-gray-100" />

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-4">
                  Детализация расходов
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Топливо', amount: calculation.costs.fuel, icon: 'Fuel' },
                    { label: 'ЗП водителя', amount: calculation.costs.salary, icon: 'User' },
                    { label: 'Амортизация', amount: calculation.costs.depreciation, icon: 'TrendingDown' },
                    { label: 'ТО и ремонт', amount: calculation.costs.maintenance, icon: 'Settings' },
                    { label: 'Гостиницы', amount: calculation.costs.hotel, icon: 'Building' },
                    { label: 'Суточные', amount: calculation.costs.dailyAllowance, icon: 'Clock' }
                  ].map(({ label, amount, icon }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Icon name={icon} size={14} className="text-gray-400" />
                        <span className="text-gray-700">{label}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {amount.toLocaleString()} ₽
                      </span>
                    </div>
                  ))}

                  {calculation.costs.services > 0 && (
                    <>
                      <Separator className="bg-gray-100" />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Icon name="Plus" size={14} className="text-gray-400" />
                          <span className="text-gray-700">Доп. услуги</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {calculation.costs.services.toLocaleString()} ₽
                        </span>
                      </div>
                    </>
                  )}

                  <Separator className="bg-gray-200" />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-gray-900">Итого</span>
                    <span className="text-xl font-bold text-blue-600">
                      {calculation.total.toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight mb-3">
                  График маршрута
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Отправление:</span>
                    <span className="font-medium text-gray-900">{calculation.departureDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Прибытие:</span>
                    <span className="font-medium text-gray-900">{calculation.arrivalDate}</span>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
                >
                  <Icon name="FileText" size={14} className="mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
                >
                  <Icon name="FileSpreadsheet" size={14} className="mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Calculator" size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Детализация маршрута
                </h3>
                <p className="text-sm text-gray-400">
                  Введите данные маршрута и нажмите "Рассчитать"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Warning */}
      {calculation?.hasProblematicPoints && !showOptimization && (
        <div className="absolute bottom-6 left-6 right-6 max-w-[1600px] mx-auto">
          <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm rounded-xl shadow-lg">
            <Icon name="AlertTriangle" size={16} className="text-amber-600" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-800 font-medium mb-1">
                    ⚠️ Точка "{calculation.problematicPoint}" значительно увеличивает маршрут и выбивается из логики.
                  </p>
                  <p className="text-amber-700 text-sm">
                    Рекомендуем рассчитать маршрут без неё. Возможно, стоит отправить отдельным ТС.
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={optimizeRoute}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 rounded-lg"
                  >
                    Рассчитать без неё
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 rounded-lg"
                  >
                    Показать сравнение
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}