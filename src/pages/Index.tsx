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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  const [toAddress, setToAddress] = useState('');
  const [toFirst, setToFirst] = useState(false);
  const [toLast, setToLast] = useState(false);
  const [cargoWeight, setCargoWeight] = useState('1');
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
        <div className="w-96 bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 pb-4">
            <div className="space-y-8">
            {/* Date */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Дата отгрузки
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-gray-200"
                  >
                    <Icon name="Calendar" className="mr-2 h-4 w-4" />
                    {format(departureDate, 'dd.MM.yyyy', { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayPicker
                    mode="single"
                    selected={departureDate}
                    onSelect={(date) => {
                      if (date) {
                        setDepartureDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    locale={ru}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

            {/* Route From */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Откуда:
              </Label>
              <Input
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="Введите адрес отправления"
                className="border-gray-200"
              />
            </div>

            {/* Route To */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Куда:
              </Label>
              <div className="space-y-3">
                <Input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="Введите адрес назначения"
                  className="border-gray-200"
                />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="to-first"
                      checked={toFirst}
                      onCheckedChange={(checked) => {
                        setToFirst(checked as boolean);
                        if (checked) setToLast(false);
                      }}
                    />
                    <Label htmlFor="to-first" className="text-sm text-gray-600">
                      Первая
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="to-last"
                      checked={toLast}
                      onCheckedChange={(checked) => {
                        setToLast(checked as boolean);
                        if (checked) setToFirst(false);
                      }}
                    />
                    <Label htmlFor="to-last" className="text-sm text-gray-600">
                      Последняя
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Points */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Промежуточные остановки:
              </Label>
              <div className="max-h-48 overflow-y-auto space-y-3 mb-3 pr-2">
                {routePoints.map((point, index) => (
                  <div key={point.id} className="space-y-2">
                    <Input
                      placeholder="Промежуточная точка"
                      value={point.address}
                      onChange={(e) => updateRoutePoint(point.id, 'address', e.target.value)}
                      className="border-gray-200"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoutePoint(point.id)}
                        className="ml-auto text-gray-400 hover:text-red-500 p-1 h-auto"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={addRoutePoint}
                disabled={routePoints.length >= 20}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                + Добавить точку
              </Button>
            </div>

            {/* One Way Option */}
            <div>
              <div className="flex items-center space-x-2 mb-4 relative group">
                <Checkbox
                  id="one-way"
                  checked={isOneWay}
                  onCheckedChange={(checked) => setIsOneWay(checked as boolean)}
                />
                <Label 
                  htmlFor="one-way" 
                  className="text-sm text-gray-600 cursor-pointer"
                >В одну сторону</Label>
                <Icon name="Info" size={14} className="text-gray-400" />
                <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  По умолчанию рассчитывается кольцевой маршрут
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Дополнительные услуги:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="loading"
                    checked={services.loading}
                    onCheckedChange={(checked) => 
                      setServices(prev => ({ ...prev, loading: checked as boolean }))
                    }
                  />
                  <Label htmlFor="loading" className="text-sm text-gray-600">
                    ПРР
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="tenting"
                    checked={services.tenting}
                    onCheckedChange={(checked) => 
                      setServices(prev => ({ ...prev, tenting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="tenting" className="text-sm text-gray-600">
                    Растентовка
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="expediting"
                    checked={services.expediting}
                    onCheckedChange={(checked) => 
                      setServices(prev => ({ ...prev, expediting: checked as boolean }))
                    }
                  />
                  <Label htmlFor="expediting" className="text-sm text-gray-600">
                    Экспедиторские
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="additional-point"
                    checked={services.additionalPoint}
                    onCheckedChange={(checked) => 
                      setServices(prev => ({ ...prev, additionalPoint: checked as boolean }))
                    }
                  />
                  <Label htmlFor="additional-point" className="text-sm text-gray-600">
                    Доп точка
                  </Label>
                </div>
              </div>
            </div>

            </div>
          </div>
          
          {/* Fixed Calculate Button */}
          <div className="p-8 pt-4 border-t border-gray-100 bg-white">
            <Button
              onClick={calculateRoute}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-medium"
              disabled={!fromAddress || !toAddress}
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