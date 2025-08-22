import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Battery, Route, ChevronRight, LogOut, Navigation, Gauge } from "lucide-react";

// Vehicle type definition based on API response
interface Vehicle {
  id: string;
  createdAt: string;
  vin: string;
  name: string;
  photoUrl: string;
  batteryStateOfChargeValue: number;
  estRange: number;
  odometerValue: number;
}

export default function Vehicles() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/vehicles/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Araçlar yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleLogout = () => {
    alert("Çıkış yapılıyor...");
  };

  const getStatusBadge = (batteryLevel: number) => {
    if (batteryLevel > 50) {
      return (
        <Badge className="bg-green-500 text-white">
          <Battery className="mr-1" size={12} />
          Aktif
        </Badge>
      );
    } else if (batteryLevel > 20) {
      return (
        <Badge className="bg-orange-500 text-white">
          <Battery className="mr-1" size={12} />
          Düşük Şarj
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500 text-white">
          <Battery className="mr-1" size={12} />
          Kritik Şarj
        </Badge>
      );
    }
  };

  const getVehicleImage = (vehicle: Vehicle) => {
    // Use the photoUrl from API if available, otherwise fallback to VIN-based images
    if (vehicle.photoUrl) {
      return vehicle.photoUrl;
    }
    
    // Fallback to different vehicle images based on VIN for variety
    const imageMap: { [key: string]: string } = {
      "NL1CSU0P10G004549": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "NL1CSU0P30G032837": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "NL1CSU0P80G053943": "https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    };
    return imageMap[vehicle.vin] || "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400";
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-togg-primary w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  const totalVehicles = vehicles?.length || 0;
  const totalDistance = vehicles?.reduce((sum, v) => sum + v.odometerValue, 0) || 0;
  const avgBatteryLevel = vehicles && vehicles.length > 0
    ? vehicles.reduce((sum, v) => sum + v.batteryStateOfChargeValue, 0) / vehicles.length
    : 0;
  const avgRange = vehicles && vehicles.length > 0
    ? vehicles.reduce((sum, v) => sum + v.estRange, 0) / vehicles.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-togg-primary rounded-lg w-10 h-10 flex items-center justify-center">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-togg-dark">Togg Analytics</h1>
                <p className="text-xs text-gray-500">Travel Data Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* <div className="text-right">
                <p className="text-sm font-medium text-gray-900" data-testid="text-username">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500" data-testid="text-email">{user?.email}</p>
              </div> */}
              {/* <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                data-testid="button-logout"
              >
                <LogOut size={16} />
              </Button> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Vehicle Selection Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-togg-dark mb-2">Araçlarınız</h2>
          <p className="text-gray-600">Seyahat verilerini görüntülemek için bir araç seçin</p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vehicles?.map((vehicle) => (
            <Link key={vehicle.id} href={`/dashboard/${vehicle.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" data-testid={`card-vehicle-${vehicle.id}`}>
                <div className="relative">
                  <img
                    src={getVehicleImage(vehicle)}
                    alt={`${vehicle.name || 'Togg Vehicle'} ${vehicle.vin}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(vehicle.batteryStateOfChargeValue)}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-togg-dark" data-testid={`text-model-${vehicle.id}`}>
                      {vehicle.name || 'Togg T10X'}
                    </h3>
                    <span className="text-sm text-gray-500" data-testid={`text-vin-${vehicle.id}`}>
                      {vehicle.vin.slice(-6)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Battery className="w-4 mr-2" />
                      <span data-testid={`text-battery-${vehicle.id}`}>
                        Şarj: %{vehicle.batteryStateOfChargeValue}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Navigation className="w-4 mr-2" />
                      <span data-testid={`text-estRange-${vehicle.id}`}>
                        Tahmini Menzil: {vehicle.estRange} KM
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Gauge className="w-4 mr-2" />
                      <span data-testid={`text-odometer-${vehicle.id}`}>
                        KM Sayacı: {vehicle.odometerValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <ChevronRight className="text-togg-secondary group-hover:translate-x-1 transition-transform" size={16} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-togg-primary mb-2" data-testid="stat-totalVehicles">
                {totalVehicles}
              </div>
              <div className="text-gray-600">Toplam Araç</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2" data-testid="stat-totalDistance">
                {totalDistance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              </div>
              <div className="text-gray-600">Toplam KM</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="stat-avgBattery">
                {avgBatteryLevel.toFixed(0)}%
              </div>
              <div className="text-gray-600">Ort. Şarj</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-togg-accent mb-2" data-testid="stat-avgRange">
                {avgRange.toFixed(0)}
              </div>
              <div className="text-gray-600">Ort. Menzil</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
