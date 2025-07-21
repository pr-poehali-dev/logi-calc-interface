import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const LogiCalc = () => {
  const [routes, setRoutes] = useState([
    { id: 1, from: 'Москва', to: '', isFirst: false, isLast: false }
  ]);
  const [cargo, setCargo] = useState('');
  const [oneWay, setOneWay] = useState(false);
  const [services, setServices] = useState({
    loading: false,
    untarp: false,
    extraPoint: false,
    expediting: false
  });
  const [showWarning, setShowWarning] = useState(true);
  const [calculated, setCalculated] = useState(false);

  const addRoute = () => {
    if (routes.length < 20) {
      setRoutes([...routes, { 
        id: Date.now(), 
        from: '', 
        to: '', 
        isFirst: false, 
        isLast: false 
      }]);
    }
  };

  const removeRoute = (id: number) => {
    if (routes.length > 1) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  const updateRoute = (id: number, field: string, value: any) => {
    setRoutes(routes.map(route => 
      route.id === id ? { ...route, [field]: value } : route
    ));
  };

  const calculate = () => {
    setCalculated(true);
    setShowWarning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">LogiCalc</h1>
          <p className="text-gray-600">Логистический калькулятор маршрута и затрат</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Route Input Block */}
          <Card className="col-span-4 shadow-sm border-gray-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icon name="Route" size={20} className="mr-2 text-blue-600" />
                Маршрут
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Base Route */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Откуда</Label>
                  <Input 
                    placeholder="Город отправления" 
                    value="Москва"
                    readOnly
                    className="mt-1 bg-gray-50"
                  />
                </div>
                
                {/* Intermediate Points */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {routes.map((route, index) => (
                    <div key={route.id} className="space-y-2 p-3 bg-white border rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">
                          Точка {index + 1}
                        </Label>
                        {routes.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeRoute(route.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        )}
                      </div>
                      <Input 
                        placeholder="Промежуточная точка"
                        value={index === 0 ? 'Санкт-Петербург' : index === 1 ? 'Новгород' : ''}
                        onChange={(e) => updateRoute(route.id, 'to', e.target.value)}
                        className="text-sm transition-colors focus:ring-apple-blue focus:border-apple-blue"
                      />
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`first-${route.id}`}
                            checked={index === 0 ? true : false}
                          />
                          <Label htmlFor={`first-${route.id}`} className="text-xs text-gray-600">
                            Первая точка
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`last-${route.id}`}
                            checked={index === 1 ? true : false}
                          />
                          <Label htmlFor={`last-${route.id}`} className="text-xs text-gray-600">
                            Последняя точка
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addRoute}
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm animate-fade-in"
                  disabled={routes.length >= 20}
                >
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить точку
                </Button>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="oneWay"
                    checked={oneWay}
                    onCheckedChange={setOneWay}
                  />
                  <Label htmlFor="oneWay" className="text-sm">
                    Только в одну сторону
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Cargo Weight */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Вес груза</Label>
                <Input 
                  placeholder="Введите вес в тоннах"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="mt-1"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Автоподбор ТС: {cargo ? (parseFloat(cargo) <= 1.5 ? 'Газель (до 1.5т)' : parseFloat(cargo) <= 5 ? 'Бычок (до 5т)' : 'Фура (до 20т)') : 'Не выбрано'}
                </div>
              </div>

              <Separator />

              {/* Additional Services */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Дополнительные услуги
                </Label>
                <div className="space-y-2">
                  {[
                    { key: 'loading', label: 'Погрузо-разгрузочные работы' },
                    { key: 'untarp', label: 'Растентовка' },
                    { key: 'extraPoint', label: 'Дополнительная точка' },
                    { key: 'expediting', label: 'Экспедиторские услуги' }
                  ].map((service) => (
                    <div key={service.key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={service.key}
                        checked={services[service.key as keyof typeof services]}
                        onCheckedChange={(checked) => 
                          setServices({...services, [service.key]: checked})
                        }
                      />
                      <Label htmlFor={service.key} className="text-sm">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

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
          <Card className="col-span-4 shadow-sm border-gray-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Icon name="Map" size={20} className="mr-2 text-green-600" />
                  Карта маршрута
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Icon name="Maximize2" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-96 flex items-center justify-center border border-gray-200/50">
                <div className="text-center text-gray-600">
                  <Icon name="MapPin" size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Карта появится после расчёта</p>
                  <p className="text-xs text-gray-500 mt-1">GraphHopper Integration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Block */}
          <Card className="col-span-4 shadow-sm border-gray-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icon name="BarChart3" size={20} className="mr-2 text-purple-600" />
                Детализация расходов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculated ? (
                <div className="space-y-4">
                  {/* Route Statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Общий км</div>
                      <div className="text-lg font-semibold">1,247</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">В одну сторону</div>
                      <div className="text-lg font-semibold">623</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Дней в пути</div>
                      <div className="text-lg font-semibold">3</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Ночей</div>
                      <div className="text-lg font-semibold">2</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Vehicle Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Выбранное ТС
                    </Label>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Фура (до 20т)
                    </Badge>
                  </div>

                  <Separator />

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Расходы</Label>
                    {[
                      { label: 'ЗП водителя', amount: '45,000' },
                      { label: 'Бензин (груженым)', amount: '28,500' },
                      { label: 'Бензин (порожним)', amount: '14,250' },
                      { label: 'ТО и ремонт', amount: '12,000' },
                      { label: 'Амортизация', amount: '8,500' },
                      { label: 'Гостиницы', amount: '6,000' },
                      { label: 'Суточные', amount: '4,500' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.amount} ₽</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>ИТОГО:</span>
                    <span className="text-green-600">118,750 ₽</span>
                  </div>

                  {/* Export Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
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
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Icon name="Calculator" size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Детализация появится после расчёта маршрута</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning Block */}
          {calculated && showWarning && (
            <div className="col-span-12">
              <Alert className="bg-amber-50 border-amber-200">
                <Icon name="AlertTriangle" size={16} className="text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-3">
                    <p>
                      <strong>Точка "Сыктывкар"</strong> значительно увеличивает маршрут и выбивается из логики. 
                      Рекомендуем рассчитать маршрут без неё. Возможно, стоит отправить отдельным ТС.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="bg-white">
                        Рассчитать без неё
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white">
                        Показать сравнение
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowWarning(false)}
                        className="ml-auto"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogiCalc;