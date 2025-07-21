import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  costs: {
    fuel: number;
    salary: number;
    depreciation: number;
    hotel: number;
    tolls: number;
    other: number;
  };
  total: number;
  hasDetours: boolean;
}

export default function Index() {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([
    { id: '1', address: '', isFirst: false, isLast: false }
  ]);
  const [shipmentDate, setShipmentDate] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [services, setServices] = useState({
    loading: false,
    tenting: false,
    expeditor: false,
    additionalPoint: false
  });
  const [calculation, setCalculation] = useState<RouteCalculation | null>(null);

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

  const calculateRoute = () => {
    // Mock calculation
    const mockCalculation: RouteCalculation = {
      distanceForward: 1250,
      distanceReturn: 1250,
      totalDistance: 2500,
      days: 3,
      nights: 2,
      costs: {
        fuel: 45000,
        salary: 18000,
        depreciation: 12500,
        hotel: 4000,
        tolls: 2500,
        other: 3000
      },
      total: 85000,
      hasDetours: routePoints.some(p => p.address.length > 0)
    };
    setCalculation(mockCalculation);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Truck" className="text-teal-600" size={24} />
            <h1 className="text-xl font-semibold text-gray-800 sf-pro-display">
              LogiCalc
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Калькулятор маршрутов и логистических затрат
          </div>
        </div>
      </div>

      {/* Main Layout - 3 columns */}
      <div className="flex h-full">
        {/* Left Panel - Route Input */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="shipment-date" className="text-sm font-medium text-gray-700">
                  Дата отгрузки
                </Label>
                <Input
                  id="shipment-date"
                  type="date"
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                  className="mt-1 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>

              <div>
                <Label htmlFor="total-weight" className="text-sm font-medium text-gray-700">
                  Общий вес (кг)
                </Label>
                <Input
                  id="total-weight"
                  type="number"
                  placeholder="20000"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(e.target.value)}
                  className="mt-1 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
            </div>

            {/* Route Points */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="from-address" className="text-sm font-medium text-gray-700">
                  Откуда
                </Label>
                <Input
                  id="from-address"
                  placeholder="Москва"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="mt-1 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>

              <div>
                <Label htmlFor="to-address" className="text-sm font-medium text-gray-700">
                  Куда
                </Label>
                <Input
                  id="to-address"
                  placeholder="Санкт-Петербург"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="mt-1 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                />
              </div>
            </div>

            {/* Intermediate Points */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Промежуточные точки
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRoutePoint}
                  disabled={routePoints.length >= 20}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {routePoints.map((point, index) => (
                  <Card key={point.id} className="border-0 bg-gray-50 shadow-none">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-500 w-6">
                            {index + 1}.
                          </span>
                          <Input
                            placeholder="Город или адрес"
                            value={point.address}
                            onChange={(e) => updateRoutePoint(point.id, 'address', e.target.value)}
                            className="border-0 bg-white text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoutePoint(point.id)}
                            className="text-gray-400 hover:text-red-500 p-1 h-6 w-6"
                          >
                            <Icon name="X" size={12} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              id={`first-${point.id}`}
                              checked={point.isFirst}
                              onCheckedChange={(checked) => 
                                updateRoutePoint(point.id, 'isFirst', checked)
                              }
                            />
                            <Label htmlFor={`first-${point.id}`} className="text-gray-600">
                              Первая
                            </Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              id={`last-${point.id}`}
                              checked={point.isLast}
                              onCheckedChange={(checked) => 
                                updateRoutePoint(point.id, 'isLast', checked)
                              }
                            />
                            <Label htmlFor={`last-${point.id}`} className="text-gray-600">
                              Последняя
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Дополнительные услуги
              </Label>
              <div className="space-y-3">
                {[
                  { key: 'loading', label: 'ПРР (погрузочно-разгрузочные работы)' },
                  { key: 'tenting', label: 'Растентовка' },
                  { key: 'expeditor', label: 'Экспедитор' },
                  { key: 'additionalPoint', label: 'Дополнительная точка' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={services[key as keyof typeof services]}
                      onCheckedChange={(checked) => 
                        setServices(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm text-gray-600">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculateRoute}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-medium"
              disabled={!fromAddress || !toAddress}
            >
              Рассчитать маршрут
            </Button>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-4">
            <Card className="h-full border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {/* Map placeholder */}
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
                  <div className="text-center">
                    <Icon name="Map" size={48} className="text-teal-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Интерактивная карта маршрута
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {calculation ? 'Маршрут построен' : 'Введите точки маршрута и нажмите "Рассчитать"'}
                    </p>
                  </div>
                </div>

                {/* Open in new window button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white shadow-sm"
                >
                  <Icon name="ExternalLink" size={16} />
                </Button>

                {/* Route summary overlay */}
                {calculation && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-gray-800">
                              {calculation.totalDistance} км
                            </div>
                            <div className="text-sm text-gray-600">
                              {calculation.days} дня, {calculation.nights} ночи
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Route Details */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          {calculation ? (
            <div className="space-y-6">
              {/* Distance Info */}
              <Card className="border-0 bg-gray-50 shadow-none">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Километраж</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Туда:</span>
                      <span className="font-medium">{calculation.distanceForward} км</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Обратно:</span>
                      <span className="font-medium">{calculation.distanceReturn} км</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Общий:</span>
                      <span>{calculation.totalDistance} км</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Info */}
              <Card className="border-0 bg-gray-50 shadow-none">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Время в пути</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">
                        {calculation.days}
                      </div>
                      <div className="text-sm text-gray-600">дня</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculation.nights}
                      </div>
                      <div className="text-sm text-gray-600">ночи</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card className="border-0 bg-gray-50 shadow-none">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Детализация расходов</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Топливо', amount: calculation.costs.fuel, icon: 'Fuel' },
                      { label: 'Зарплата водителя', amount: calculation.costs.salary, icon: 'User' },
                      { label: 'Амортизация', amount: calculation.costs.depreciation, icon: 'TrendingDown' },
                      { label: 'Гостиница', amount: calculation.costs.hotel, icon: 'Building' },
                      { label: 'Платные дороги', amount: calculation.costs.tolls, icon: 'Car' },
                      { label: 'Прочие расходы', amount: calculation.costs.other, icon: 'MoreHorizontal' }
                    ].map(({ label, amount, icon }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Icon name={icon} size={14} className="text-gray-400" />
                          <span className="text-gray-600">{label}</span>
                        </div>
                        <span className="font-medium">{amount.toLocaleString()} ₽</span>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-gray-800">Итого</span>
                      <span className="text-xl font-bold text-teal-600">
                        {calculation.total.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                  <Icon name="FileText" size={14} className="mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                  <Icon name="FileSpreadsheet" size={14} className="mr-2" />
                  Excel
                </Button>
              </div>

              {/* Detour Warning */}
              {calculation.hasDetours && (
                <Card className="border border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon name="AlertTriangle" size={16} className="text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800 mb-1">
                          Маршрут удлиняется
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Промежуточные точки увеличивают километраж на 15%
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-orange-700 border-orange-200 hover:bg-orange-100">
                            Оптимизировать
                          </Button>
                          <Button size="sm" variant="ghost" className="text-orange-600 hover:bg-orange-100">
                            Сравнить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon name="Calculator" size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Детализация маршрута
                </h3>
                <p className="text-gray-400 text-sm">
                  Здесь появится подробная информация о расходах после расчета
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}