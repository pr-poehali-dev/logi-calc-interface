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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('Пермь');
  const [cargoWeight, setCargoWeight] = useState('1');
  const [departureDate, setDepartureDate] = useState('22.07.2025');
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
    const hasProblematic = routePoints.some(p => p.address.toLowerCase().includes('вязники'));
    
    const mockCalculation: RouteCalculation = {
      distanceForward: 684,
      distanceReturn: isOneWay ? 0 : 684,
      totalDistance: isOneWay ? 684 : 1375,
      days: 4,
      nights: 3,
      departureDate: '22.07 в 08:00',
      arrivalDate: '25.01.2025 в 13:45',
      vehicleType: getVehicleType(cargoWeight),
      costs: {
        fuel: hasProblematic ? 14851 : 12000,
        salary: 14850,
        depreciation: hasProblematic ? 6971 : 5500,
        hotel: 7306,
        maintenance: 3000,
        dailyAllowance: 2800,
        services: (services.loading ? 5000 : 0) + 
                 (services.tenting ? 2500 : 0) + 
                 (services.expediting ? 8000 : 0) + 
                 (services.additionalPoint ? 3000 : 0)
      },
      total: 0,
      hasProblematicPoints: hasProblematic,
      problematicPoint: hasProblematic ? 'Вязники' : undefined
    };

    mockCalculation.total = Object.values(mockCalculation.costs).reduce((sum, cost) => sum + cost, 0);
    setCalculation(mockCalculation);
    setShowOptimization(false);
  };

  const optimizeRoute = () => {
    if (calculation) {
      const optimized = { ...calculation };
      optimized.costs.fuel = 12000;
      optimized.costs.depreciation = 5500;
      optimized.totalDistance = 1100;
      optimized.total = Object.values(optimized.costs).reduce((sum, cost) => sum + cost, 0);
      optimized.hasProblematicPoints = false;
      optimized.problematicPoint = undefined;
      setCalculation(optimized);
      setShowOptimization(true);
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">
          LogiCalc
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Panel - Route Input */}
        <div className="w-96 bg-white p-8 overflow-y-auto">
          <div className="space-y-8">
            {/* Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Дата отгрузки
              </Label>
              <Select value={departureDate} onValueChange={setDepartureDate}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22.07.2025">22.07.2025</SelectItem>
                  <SelectItem value="23.07.2025">23.07.2025</SelectItem>
                  <SelectItem value="24.07.2025">24.07.2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cargo Weight */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Общий вес (кг.)
              </Label>
              <Input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="border-gray-200"
                min="0.1"
                step="0.1"
              />
            </div>

            {/* Route */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Откуда:
              </Label>
              <Select value={toAddress} onValueChange={setToAddress}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Пермь">Пермь</SelectItem>
                  <SelectItem value="Москва">Москва</SelectItem>
                  <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Route Points */}
            <div>
              {routePoints.map((point, index) => (
                <div key={point.id} className="mb-3">
                  <Input
                    placeholder="Промежуточная точка"
                    value={point.address}
                    onChange={(e) => updateRoutePoint(point.id, 'address', e.target.value)}
                    className="border-gray-200 mb-2"
                  />
                  <div className="flex items-center space-x-4">
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
                      />
                      <Label htmlFor={`first-${point.id}`} className="text-sm text-gray-600">
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
                      />
                      <Label htmlFor={`last-${point.id}`} className="text-sm text-gray-600">
                        Последняя
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={addRoutePoint}
                disabled={routePoints.length >= 20}
                className="text-gray-600 p-0 h-auto"
              >
                + Добавить точку
              </Button>
            </div>

            {/* Additional Services */}
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="expediting"
                    checked={services.expediting}
                    onCheckedChange={(checked) => 
                      setServices(prev => ({ ...prev, expediting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="expediting" className="text-sm text-gray-600">
                    Экспедитор
                  </Label>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculateRoute}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-medium"
              disabled={!toAddress}
            >
              Рассчитать маршрут
            </Button>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 bg-gray-50 p-8">
          <Card className="h-full border-0 shadow-none bg-white rounded-none">
            <CardContent className="p-8 h-full flex flex-col">
              {/* Map placeholder */}
              <div className="flex-1 bg-gray-100 rounded-lg mb-6 flex items-center justify-center relative">
                {calculation && (
                  <div className="text-center">
                    <div className="mb-6">
                      <svg width="300" height="200" viewBox="0 0 300 200" className="mx-auto">
                        <path
                          d="M50 150 Q100 100 150 120 Q200 140 250 100"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          fill="none"
                        />
                        <circle cx="50" cy="150" r="4" fill="#ef4444" />
                        <circle cx="150" cy="120" r="4" fill="#3b82f6" />
                        <circle cx="250" cy="100" r="4" fill="#22c55e" />
                        <text x="50" y="170" fontSize="12" textAnchor="middle" fill="#6b7280">Москва</text>
                        <text x="150" y="110" fontSize="12" textAnchor="middle" fill="#6b7280">Вязники</text>
                        <text x="250" y="90" fontSize="12" textAnchor="middle" fill="#6b7280">{toAddress}</text>
                      </svg>
                    </div>
                  </div>
                )}
                {!calculation && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Icon name="Map" size={20} />
                    <span>Карта появится после расчета</span>
                  </div>
                )}
              </div>

              {/* Route Details */}
              {calculation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Маршрут
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Марвлудзтать</span>
                      </div>
                      <span className="font-medium">{calculation.totalDistance} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Вязники</span>
                      </div>
                      <span className="font-medium">{calculation.distanceForward} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Дни</span>
                      </div>
                      <span className="font-medium">{calculation.days} d</span>
                    </div>
                  </div>
                  
                  {calculation.hasProblematicPoints && (
                    <Alert className="mt-4 border-amber-300 bg-amber-50">
                      <Icon name="AlertTriangle" size={16} className="text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Маршрут сильно удлиняется из за крюка через базники
                        <Button variant="link" className="text-amber-700 p-0 ml-2 h-auto">
                          Скрыть
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Timeline */}
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>22.07.2025</span>
                      <span>08:00</span>
                      <span className="text-gray-500">25.01.2025 13:45</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Вязники</span>
                      <span>24:07</span>
                      <span className="text-gray-500">Москва</span>
                      <span className="text-gray-500">13:45</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cost Details */}
        <div className="w-80 bg-white p-8 overflow-y-auto">
          {calculation ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Детент детали
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Общая km</span>
                  <span className="font-medium">{calculation.totalDistance} km</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Срокч пу'в</span>
                  <span className="font-medium">{calculation.distanceForward} km</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Домч</span>
                  <span className="font-medium">{calculation.days}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <span className="text-gray-600">Амортизацция</span>
                  <span className="font-medium">{calculation.costs.depreciation.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Топливо</span>
                  <span className="font-medium">{calculation.costs.fuel.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Зарплата</span>
                  <span className="font-medium">{calculation.costs.salary.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Гостиница</span>
                  <span className="font-medium">{calculation.costs.hotel.toLocaleString()}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого</span>
                  <span>{calculation.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex space-x-4 mt-8">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Excel
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Icon name="FileText" size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Детализация появится после расчета</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}