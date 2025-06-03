import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Shield, 
  Smartphone, 
  BarChart3,
  Leaf,
  Users
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: TrendingUp,
      title: "Отслеживание финансов",
      description: "Полный контроль над доходами и расходами"
    },
    {
      icon: BarChart3,
      title: "Аналитика и отчеты",
      description: "Детальные отчеты и визуализация данных"
    },
    {
      icon: Leaf,
      title: "Эко-мониторинг",
      description: "Отслеживайте экологическое влияние ваших трат"
    },
    {
      icon: Shield,
      title: "Безопасность",
      description: "Ваши данные защищены современным шифрованием"
    },
    {
      icon: Smartphone,
      title: "Адаптивный дизайн",
      description: "Работает на всех устройствах"
    },
    {
      icon: Users,
      title: "Простота использования",
      description: "Интуитивный интерфейс для всех"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FinanceApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-primary">
                  Регистрация
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Управляйте финансами
              <span className="block text-emerald-600">разумно и экологично</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Современное приложение для учета доходов и расходов с уникальной функцией 
              мониторинга экологического воздействия ваших трат
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-3">
                  Начать использовать
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-gray-200 text-gray-700 hover:bg-gray-50 text-lg px-8 py-3">
                  Уже есть аккаунт?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Все что нужно для управления финансами
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Простые и мощные инструменты для полного контроля над вашими финансами
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="premium-card">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="premium-card">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Готовы начать?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Присоединяйтесь к тысячам пользователей, которые уже контролируют свои финансы
              </p>
              <Link href="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-3">
                  Создать аккаунт
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">FinanceApp</h3>
            <p className="text-gray-400">
              © 2024 FinanceApp. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}