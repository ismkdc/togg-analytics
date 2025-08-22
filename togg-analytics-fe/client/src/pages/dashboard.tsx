import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Car, 
  ArrowLeft} from "lucide-react";

// Trip data type definition based on API response
interface TripData {
  carId: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  movedMeters: number | null;
}

// Vehicle type definition
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

// Mock data for dashboard
const mockVehicle = {
  id: "togg-t10x-001",
  model: "Togg T10X",
  plate: "34 ABC 123",
  year: 2024,
  batteryLevel: 87,
  totalKm: 12450,
  status: "active",
};

const mockTravelData = [
  {
    id: "1",
    vehicleId: "togg-t10x-001",
    startLocation: "İstanbul",
    endLocation: "Ankara",
    route: "D-020 Otoyolu",
    distance: "456.00",
    duration: 272,
    avgSpeed: "89.20",
    energyConsumption: "19.80",
    consumptionPer100km: "43.40",
    tripDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
  }
];

const mockAnalytics = {
  totalDistance: 551.0,
  totalDuration: 6.5,
  avgSpeed: 60.3,
  avgConsumption: 26.2,
  totalTrips: 3,
  efficiencyScore: 7.4,
};

// Location details component
function LocationDetails({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [locationInfo, setLocationInfo] = useState<{ mahalle: string; ilce: string; il: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        setIsLoading(true);
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const addr = data.address || {};

        setLocationInfo({
          mahalle: addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || 'Bilinmiyor',
          ilce: addr.town || addr.county || addr.city_district || addr.city || 'Bilinmiyor',
          il: addr.province || addr.state || addr.county || addr.city || 'Bilinmiyor'
        });
      } catch (e) {
        console.error('Location fetch error:', e);
        setLocationInfo({ mahalle: 'Hata', ilce: 'Hata', il: 'Hata' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationInfo();
  }, [latitude, longitude]);

  if (isLoading) {
    return <span className="text-gray-400">Yükleniyor...</span>;
  }

  if (!locationInfo) {
    return <span className="text-gray-400">Konum bilgisi yok</span>;
  }

  return (
    <span>
      {locationInfo.mahalle}, {locationInfo.ilce}, {locationInfo.il}
    </span>
  );
}

// Map component for displaying travel route
function TravelMap({ tripData }: { tripData: TripData[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !tripData.length) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);

      // Add Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      script.onload = () => {
        // @ts-ignore - Leaflet is loaded globally
        const L = (window as any).L;
        
        // Use real trip data points
        const points = tripData.map(trip => ({
          lat: trip.latitude,
          lng: trip.longitude,
          timestamp: trip.createdAt,
          movedMeters: trip.movedMeters
        }));

        if (points.length === 0) return;

        // Calculate center and zoom based on actual data
        const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
        const map = L.map(mapRef.current).fitBounds(bounds);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const latlngs: [number, number][] = [];

        const reverseGeocode = async (p: {lat: number, lng: number, timestamp: string, movedMeters: number | null}, label: number) => {
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lng}`);
            const data = await resp.json();
            const addr = data.address || {};

            const mahalle = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || 'Bilinmiyor';
            const ilce = addr.town || addr.county || addr.city_district || addr.city || 'Bilinmiyor';
            const il = addr.province || addr.state || addr.county || addr.city || 'Bilinmiyor';

            const status = p.movedMeters ? 'Hareket' : 'Başlangıç';
            const distance = p.movedMeters ? ` (${(p.movedMeters / 1000).toFixed(2)} km)` : '';

            const marker = L.marker([p.lat, p.lng]).addTo(map)
              .bindPopup(`<b>Nokta ${label}</b><br>Durum: ${status}${distance}<br>İl: ${il}<br>İlçe: ${ilce}<br>Mahalle: ${mahalle}<br>Tarih: ${new Date(p.timestamp).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`)
              .openPopup();

            latlngs.push([p.lat, p.lng]);

            if (latlngs.length > 1) {
              L.polyline(latlngs, {color: 'blue'}).addTo(map);
            }

          } catch (e) {
            console.error('Reverse geocode error:', e);
          }
        };

        // Rate limit: 1 request per second
        const processPoints = async () => {
          for (let i = 0; i < points.length; i++) {
            await reverseGeocode(points[i], i + 1);
            await new Promise(r => setTimeout(r, 1000)); // 1 saniye bekle
          }
        };

        processPoints();
      };
      document.head.appendChild(script);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [tripData]);

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Seyahat Rotası</h3>
          <p className="text-sm text-gray-500">Araç konum ve hareket bilgileri</p>
        </div>
        <div ref={mapRef} style={{ height: '400px' }} className="w-full" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tripData, setTripData] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripDataType, setTripDataType] = useState<string>("0"); // 0: günlük, 1: haftalık, 2: aylık
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch vehicle info
        const vehicleResponse = await fetch(`/api/vehicles/`);
        if (!vehicleResponse.ok) {
          throw new Error(`Vehicle fetch error: ${vehicleResponse.status}`);
        }
        
        const vehicles: Vehicle[] = await vehicleResponse.json();
        const currentVehicle = vehicles.find(v => v.id === vehicleId);
        
        if (!currentVehicle) {
          throw new Error('Vehicle not found');
        }
        
        setVehicle(currentVehicle);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  // Separate effect for trip data type changes
  useEffect(() => {
    if (!vehicleId) return;

    const fetchTripData = async () => {
      setIsRefreshing(true);
      setError(null);
      
      try {
        // Fetch trip data with type parameter
        const tripResponse = await fetch(`/api/vehicles/${vehicleId}/trip-data?type=${tripDataType}`);
        if (!tripResponse.ok) {
          throw new Error(`Trip data fetch error: ${tripResponse.status}`);
        }
        
        const tripDataResponse: TripData[] = await tripResponse.json();
        setTripData(tripDataResponse);
        
      } catch (err) {
        console.error('Error fetching trip data:', err);
        setError('Seyahat verileri yüklenirken bir hata oluştu');
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchTripData();
  }, [vehicleId, tripDataType]);

  const handleLogout = () => {
    alert("Çıkış yapılıyor...");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // The API returns UTC time, convert to Turkey timezone (UTC+3)
    const turkeyTime = new Date(date.getTime());
    return turkeyTime.toLocaleString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            Tamamlandı
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Devam Ediyor
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            İptal Edildi
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
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
          <Link href="/vehicles">
            <Button>Araçlara Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Araç bulunamadı</h2>
          <Link href="/vehicles">
            <Button>Araçlara Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate trip statistics from real data
  const totalTrips = tripData.length;
  const totalDistance = tripData.reduce((sum, trip) => sum + (trip.movedMeters || 0), 0) / 1000; // Convert to km

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header with Vehicle Info */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/vehicles">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600" data-testid="button-back">
                  <ArrowLeft size={18} />
                </Button>
              </Link>
              <div className="bg-togg-primary rounded-lg w-10 h-10 flex items-center justify-center">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-togg-dark" data-testid="text-vehicle-title">
                  {vehicle.name || 'Togg T10X'} - {vehicle.vin.slice(-6)}
                </h1>
                <p className="text-xs text-gray-500">Seyahat Verileri</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map Component */}
        <TravelMap tripData={tripData} />
        
        {/* Trip Data Table */}
        <Card>
          <CardContent>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Seyahat Verileri</h3>
                  <p className="text-sm text-gray-500">Araç konum ve hareket bilgileri</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Veri Tipi:</label>
                  <Select value={tripDataType} onValueChange={setTripDataType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Günlük</SelectItem>
                      <SelectItem value="1">Haftalık</SelectItem>
                      <SelectItem value="2">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                  {isRefreshing && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-togg-primary w-4 h-4"></div>
                      <span>Yükleniyor...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Koordinatlar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hareket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tripData.map((trip, index) => (
                    <tr key={trip.carId + index} className="hover:bg-gray-50 transition-colors" data-testid={`row-trip-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-date-${index}`}>
                        {formatDate(trip.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900" data-testid={`text-location-${index}`}>
                          {trip.latitude.toFixed(6)}, {trip.longitude.toFixed(6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          <LocationDetails latitude={trip.latitude} longitude={trip.longitude} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-coordinates-${index}`}>
                        {trip.latitude.toFixed(4)}°N, {trip.longitude.toFixed(4)}°E
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-movement-${index}`}>
                        {trip.movedMeters ? `${(trip.movedMeters / 1000).toFixed(2)} km` : 'İlk kayıt'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-testid={`badge-status-${index}`}>
                        {trip.movedMeters ? 
                          <Badge className="bg-green-100 text-green-800">Hareket</Badge> :
                          <Badge className="bg-blue-100 text-blue-800">Başlangıç</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-togg-primary mb-2">
                {totalTrips}
              </div>
              <div className="text-gray-600">Toplam Kayıt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalDistance.toFixed(2)}
              </div>
              <div className="text-gray-600">Toplam Mesafe (km)</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
