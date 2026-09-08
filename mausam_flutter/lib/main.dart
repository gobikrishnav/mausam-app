import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/interest_selection/interest_selection_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/customize/customize_homepage_screen.dart';
import 'screens/alerts/severe_weather_alert_screen.dart';
import 'screens/profile/profile_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set official IMD light status bar styling
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const MausamApp());
}

class MausamApp extends StatelessWidget {
  const MausamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mausam - India Meteorological Department',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/interests': (context) => const InterestSelectionScreen(),
        '/home': (context) => const HomeScreen(),
        '/customize': (context) => const CustomizeHomepageScreen(),
        '/alert': (context) => const SevereWeatherAlertScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}
