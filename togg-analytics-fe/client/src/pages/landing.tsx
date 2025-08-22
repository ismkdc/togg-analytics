import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, Users, BarChart3, ThumbsUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-togg-primary to-togg-secondary items-center justify-center p-12">
        <div className="text-center text-white">
          <img 
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
            alt="Modern electric vehicle dashboard" 
            className="rounded-2xl shadow-2xl mb-8 w-full max-w-md mx-auto" 
          />
          <h1 className="text-4xl font-bold mb-4">Togg Travel Analytics</h1>
          <p className="text-xl opacity-90 mb-8">Araç verilerinizi takip edin, sürüş deneyiminizi optimize edin</p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">500K+</div>
              <div className="opacity-75">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1M+</div>
              <div className="opacity-75">Seyahat Verisi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="opacity-75">Memnuniyet</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-togg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Car className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-togg-dark mb-2">Trumore ile Giriş</h2>
            <p className="text-gray-600">Togg araç verilerinize erişim için giriş yapın</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</Label>
              <Input 
                type="email" 
                placeholder="ornek@trumore.com" 
                className="w-full"
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Şifre</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="w-full"
                data-testid="input-password"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" data-testid="checkbox-remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600">Beni hatırla</Label>
              </div>
              <a href="#" className="text-sm text-togg-secondary hover:text-togg-primary transition-colors">
                Şifremi unuttum?
              </a>
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-togg-primary hover:bg-togg-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              data-testid="button-login"
            >
              <Car className="mr-2" size={20} />
              Giriş Yap
            </Button>
            
            <div className="text-center">
              <span className="text-gray-600">Trumore hesabınız yok mu? </span>
              <a href="#" className="text-togg-secondary hover:text-togg-primary font-medium transition-colors">
                Kayıt olun
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Güvenli giriş için Trumore altyapısı kullanılmaktadır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
