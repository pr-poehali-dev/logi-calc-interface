import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface RoutePoint {
  id: string;
  location: string;
}

export default function Index() {
  const [fromLocation, setFromLocation] = useState('Москва');
  const [toLocation, setToLocation] = useState('Екатеринбург');
  const [routes, setRoutes] = useState<RoutePoint[]>([
    { id: '1', location: 'Санкт-Петербург' },
    { id: '2', location: 'Новгород' }
  ]);
  const [cargoWeight, setCargoWeight] = useState('5');
  const [isFirstPoint, setIsFirstPoint] = useState(false);
  const [isLastPoint, setIsLastPoint] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  const [services, setServices] = useState({
    loading: false,
    tenting: false,
    extraPoint: false,
    forwarding: false
  });
  const [showWarning, setShowWarning] = useState(false);

  const addRoute = () => {
    if (routes.length < 20) {
      setRoutes([...routes, { id: Date.now().toString(), location: '' }]);
    }
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  const updateRoute = (id: string, field: string, value: string) => {
    setRoutes(routes.map(route => 
      route.id === id ? { ...route, [field]: value } : route
    ));
  };

  const calculate = () => {
    setShowWarning(true);
  };

  const getSelectedVehicle = (weight: string) => {
    const w = parseFloat(weight);
    if (w <= 3.5) return 'Газель (до 3.5т)';
    if (w <= 10) return 'МАН 10т';
    return 'Фура 20т';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">LOGICALC</h1>
            <p className="text-gray-600 mt-1">Логистический калькулятор маршрутов и затрат</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Icon name="Menu" size={16} className="mr-2" />
              Меню
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="User" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        
        {/* Route Input Block */}
        <Card className="col-span-4 shadow-sm border-gray-200/50 animate-fade-in transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Icon name="Route" size={20} className="mr-2 text-blue-600" />
              Ввод маршрута
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From/To Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="from" className="text-sm font-medium text-gray-700">Откуда</Label>
                <Input 
                  id="from"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="mt-1 transition-colors focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="to" className="text-sm font-medium text-gray-700">Куда</Label>
                <Input 
                  id="to"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="mt-1 transition-colors focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <Separator />

            {/* Intermediate Points */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Промежуточные точки ({routes.length}/20)
              </Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {routes.map((route, index) => (
                  <div key={route.id} className="flex items-center space-x-2 animate-fade-in">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 z-10">
                        {index + 1}
                      </span>
                      <Input 
                        placeholder="Промежуточная точка"
                        value={route.location}
                        onChange={(e) => updateRoute(route.id, 'location', e.target.value)}
                        className="text-sm pl-8 transition-colors focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {routes.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeRoute(route.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addRoute}
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm animate-fade-in mt-3"
                disabled={routes.length >= 20}
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить точку
              </Button>
            </div>

            <Separator />

            {/* Route Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Настройки маршрута</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="firstPoint"
                    checked={isFirstPoint}
                    onCheckedChange={(checked) => {
                      setIsFirstPoint(checked as boolean);
                      if (checked) setIsLastPoint(false);
                    }}
                  />
                  <Label htmlFor="firstPoint" className="text-sm text-gray-600">Первая точка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lastPoint"
                    checked={isLastPoint}
                    onCheckedChange={(checked) => {
                      setIsLastPoint(checked as boolean);
                      if (checked) setIsFirstPoint(false);
                    }}
                  />
                  <Label htmlFor="lastPoint" className="text-sm text-gray-600">Последняя точка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="oneWay"
                    checked={isOneWay}
                    onCheckedChange={(checked) => setIsOneWay(checked as boolean)}
                  />
                  <Label htmlFor="oneWay" className="text-sm text-gray-600">Только в одну сторону</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cargo Weight */}
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">Вес груза (тонны)</Label>
              <Input 
                id="weight"
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="mt-1 transition-colors focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                step="0.1"
              />
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Автоподбор: {getSelectedVehicle(cargoWeight)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Additional Services */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Дополнительные услуги</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="loading"
                    checked={services.loading}
                    onCheckedChange={(checked) => setServices(prev => ({...prev, loading: checked as boolean}))}
                  />
                  <Label htmlFor="loading" className="text-xs text-gray-600">ПРР</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tenting"
                    checked={services.tenting}
                    onCheckedChange={(checked) => setServices(prev => ({...prev, tenting: checked as boolean}))}
                  />
                  <Label htmlFor="tenting" className="text-xs text-gray-600">Растентовка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="extraPoint"
                    checked={services.extraPoint}
                    onCheckedChange={(checked) => setServices(prev => ({...prev, extraPoint: checked as boolean}))}
                  />
                  <Label htmlFor="extraPoint" className="text-xs text-gray-600">Доп. точка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="forwarding"
                    checked={services.forwarding}
                    onCheckedChange={(checked) => setServices(prev => ({...prev, forwarding: checked as boolean}))}
                  />
                  <Label htmlFor="forwarding" className="text-xs text-gray-600">Экспедирование</Label>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={calculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Icon name="Calculator" size={16} className="mr-2" />
              Рассчитать
            </Button>
          </CardContent>
        </Card>

        {/* Map Block */}
        <Card className="col-span-4 shadow-sm border-gray-200/50 animate-fade-in transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icon name="Map" size={20} className="mr-2 text-green-600" />
                Карта маршрута
              </CardTitle>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                <Icon name="Maximize2" size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200/50 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Icon name="Map" size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm font-medium">GraphHopper карта</p>
                <p className="text-gray-400 text-xs">localhost:8989</p>
                <div className="mt-4 text-xs text-gray-400">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Москва</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Санкт-Петербург</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Новгород</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Екатеринбург</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Route Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Общий маршрут:</span>
                  <span className="font-medium">1,247 км</span>
                </div>
                <div className="flex justify-between">
                  <span>Время в пути:</span>
                  <span className="font-medium">16ч 20мин</span>
                </div>
                <div className="flex justify-between">
                  <span>Точек:</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown Block */}
        <Card className="col-span-4 shadow-sm border-gray-200/50 animate-fade-in transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icon name="Receipt" size={20} className="mr-2 text-purple-600" />
                Детализация расходов
              </CardTitle>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" className="text-xs hover:bg-gray-50 transition-colors">
                  <Icon name="Download" size={14} className="mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs hover:bg-gray-50 transition-colors">
                  <Icon name="FileSpreadsheet" size={14} className="mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Route Details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">Общий км</div>
                  <div className="text-lg font-semibold">1,247</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">В одну сторону</div>
                  <div className="text-lg font-semibold">624</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">Дней в пути</div>
                  <div className="text-lg font-semibold">2</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">Ночей</div>
                  <div className="text-lg font-semibold">1</div>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-gray-600">
                <div className="mb-2 font-medium">Транспортное средство:</div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {getSelectedVehicle(cargoWeight)}
                </Badge>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Расходы:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ЗП водителя:</span>
                  <span>12,000 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Бензин (гружёный):</span>
                  <span>18,705 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Бензин (порожний):</span>
                  <span>9,360 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ТО и ремонт:</span>
                  <span>3,741 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Амортизация:</span>
                  <span>6,235 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Гостиницы:</span>
                  <span>2,000 ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Суточные:</span>
                  <span>1,400 ₽</span>
                </div>

                {/* Additional Services */}
                {(services.loading || services.tenting || services.extraPoint || services.forwarding) && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-xs text-gray-500 mb-1">Дополнительные услуги:</div>
                    {services.loading && (
                      <div className="flex justify-between text-gray-600">
                        <span>ПРР:</span>
                        <span>5,000 ₽</span>
                      </div>
                    )}
                    {services.tenting && (
                      <div className="flex justify-between text-gray-600">
                        <span>Растентовка:</span>
                        <span>2,500 ₽</span>
                      </div>
                    )}
                    {services.extraPoint && (
                      <div className="flex justify-between text-gray-600">
                        <span>Доп. точка:</span>
                        <span>3,000 ₽</span>
                      </div>
                    )}
                    {services.forwarding && (
                      <div className="flex justify-between text-gray-600">
                        <span>Экспедирование:</span>
                        <span>8,000 ₽</span>
                      </div>
                    )}
                  </>
                )}

                <Separator className="my-2" />
                
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>ИТОГО:</span>
                  <span className="text-green-600">
                    {53441 + 
                     (services.loading ? 5000 : 0) + 
                     (services.tenting ? 2500 : 0) + 
                     (services.extraPoint ? 3000 : 0) + 
                     (services.forwarding ? 8000 : 0)
                    } ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-3">График маршрута:</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Отгрузка (Москва):</span>
                  <span>24.07 в 08:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Прибытие (СПб):</span>
                  <span>24.07 в 16:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Выгрузка (Новгород):</span>
                  <span>25.07 в 11:20</span>
                </div>
                <div className="flex justify-between">
                  <span>Прибытие (Екатеринбург):</span>
                  <span>25.07 в 20:45</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Block (appears after calculation) */}
        {showWarning && (
          <div className="col-span-12 mt-6 animate-fade-in">
            <Alert className="border-orange-200 bg-orange-50">
              <Icon name="AlertTriangle" size={16} className="text-orange-600" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-orange-800 font-medium mb-1">
                      ⚠️ Точка "Сыктывкар" значительно увеличивает маршрут и выбивается из логики.
                    </p>
                    <p className="text-orange-700 text-sm">
                      Рекомендуем рассчитать маршрут без неё. Возможно, стоит отправить отдельным ТС.
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100 transition-colors">
                      Рассчитать без неё
                    </Button>
                    <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100 transition-colors">
                      Показать сравнение
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}