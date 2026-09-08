import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';
import '../../models/feedback_event_model.dart';
import '../../services/personalization_engine.dart';
import '../../widgets/cards/hero_weather_card.dart';
import '../../widgets/cards/severe_alert_banner.dart';
import '../../widgets/cards/best_outdoor_window_card.dart';
import '../../widgets/cards/aqi_card.dart';
import '../../widgets/cards/uv_index_card.dart';
import '../../widgets/navigation/mausam_bottom_nav_bar.dart';
import '../customize/customize_homepage_screen.dart';
import '../card_detail/card_detail_screen.dart';
import '../card_menu/card_menu_sheet.dart';
import '../alerts/severe_weather_alert_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentNavIndex = 0;
  late List<WeatherCardModel> _rankedCards;
  late WeatherCardModel _overviewCard;

  @override
  void initState() {
    super.initState();
    _refreshCards();
  }

  void _refreshCards() {
    final engine = PersonalizationEngine();
    final allCards = engine.getRankedHomepageCards();

    // Separate overview hero card from other modular cards
    _overviewCard = allCards.firstWhere(
      (c) => c.type == WeatherCardType.overview,
      orElse: () => engine.getInitialCards().first,
    );

    // Remaining recommendation cards
    _rankedCards = allCards.where((c) => c.type != WeatherCardType.overview).toList();
    setState(() {});
  }

  void _onBottomNavTapped(int index) {
    if (index == _currentNavIndex) return;

    if (index == 1) {
      // Map tab -> Severe alert / radar map
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const SevereWeatherAlertScreen()),
      );
    } else if (index == 2) {
      // Alerts tab
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const SevereWeatherAlertScreen()),
      );
    } else if (index == 3) {
      // Profile tab
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const ProfileScreen()),
      ).then((_) => _refreshCards());
    }
  }

  void _openCardDetail(WeatherCardModel card) {
    PersonalizationEngine().recordFeedback(card.id, FeedbackEventType.cardClick);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CardDetailScreen(card: card),
      ),
    ).then((_) => _refreshCards());
  }

  void _openCardMenu(WeatherCardModel card) {
    CardMenuSheet.show(
      context,
      card: card,
      onPinChanged: _refreshCards,
      onCardHidden: _refreshCards,
    );
  }

  void _openCustomizeHomepage() async {
    final updated = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CustomizeHomepageScreen(),
      ),
    );
    if (updated == true) {
      _refreshCards();
    }
  }

  WeatherCardModel? _findFirst(WeatherCardType type) {
    for (final card in _rankedCards) {
      if (card.type == type) return card;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final user = PersonalizationEngine().currentUser;

    // Split cards into best outdoor window, aqi & uv index, and other cards
    final outdoorCard = _findFirst(WeatherCardType.bestOutdoorWindow);
    final aqiCard = _findFirst(WeatherCardType.aqi);
    final uvCard = _findFirst(WeatherCardType.uvIndex);
    final otherCards = _rankedCards.where((c) =>
        c.type != WeatherCardType.bestOutdoorWindow &&
        c.type != WeatherCardType.aqi &&
        c.type != WeatherCardType.uvIndex).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top App Bar: Location Dropdown + Bell + Avatar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Location Chip
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Current synoptic station: Chennai (Meenambakkam)',
                            style: AppTypography.bodySmall.copyWith(color: Colors.white),
                          ),
                          backgroundColor: AppColors.navyPrimary,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.location_on_rounded,
                            color: AppColors.navyPrimary,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            user.location,
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.navyPrimary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.keyboard_arrow_down_rounded,
                            color: AppColors.navyPrimary,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Actions: Notification Bell + Avatar
                  Row(
                    children: [
                      // Bell with badge
                      Stack(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.notifications_none_rounded),
                            color: AppColors.navyPrimary,
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const SevereWeatherAlertScreen(),
                                ),
                              );
                            },
                          ),
                          Positioned(
                            right: 10,
                            top: 10,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.alertRed,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 4),

                      // Avatar circle
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const ProfileScreen(),
                            ),
                          ).then((_) => _refreshCards());
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: AppColors.navyPrimary,
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Text(
                              'S',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Scrollable Dynamic Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Personalized Greeting
                    Text(
                      'Good morning, Saran',
                      style: AppTypography.h1.copyWith(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppColors.navyPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Stay informed. Stay prepared.',
                      style: AppTypography.caption.copyWith(
                        fontSize: 13,
                        color: AppColors.textMuted,
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Hero Weather Card
                    HeroWeatherCard(weatherData: _overviewCard.data),

                    const SizedBox(height: 12),

                    // Severe Weather Alert Banner (Safety Override)
                    SevereAlertBanner(
                      message: 'Rain expected in 2 hours',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SevereWeatherAlertScreen(),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 20),

                    // "Recommended for you" Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recommended for you',
                          style: AppTypography.h3.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.navyPrimary,
                          ),
                        ),
                        GestureDetector(
                          onTap: _openCustomizeHomepage,
                          child: Text(
                            'Customize',
                            style: AppTypography.caption.copyWith(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.navySecondary,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Dynamic Best Outdoor Window Card
                    if (outdoorCard != null) ...[
                      BestOutdoorWindowCard(
                        card: outdoorCard,
                        onTap: () => _openCardDetail(outdoorCard),
                        onMenuTap: () => _openCardMenu(outdoorCard),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // 2-Column Grid: AQI & UV Index
                    if (aqiCard != null || uvCard != null) ...[
                      Row(
                        children: [
                          if (aqiCard != null)
                            Expanded(
                              child: AqiCard(
                                card: aqiCard,
                                onTap: () => _openCardDetail(aqiCard),
                                onMenuTap: () => _openCardMenu(aqiCard),
                              ),
                            ),
                          if (aqiCard != null && uvCard != null)
                            const SizedBox(width: 12),
                          if (uvCard != null)
                            Expanded(
                              child: UvIndexCard(
                                card: uvCard,
                                onTap: () => _openCardDetail(uvCard),
                                onMenuTap: () => _openCardMenu(uvCard),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Any other dynamically recommended cards
                    ...otherCards.map((card) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.wb_twilight_rounded,
                                color: AppColors.navyPrimary,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    card.title,
                                    style: AppTypography.h3.copyWith(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.navyPrimary,
                                    ),
                                  ),
                                  Text(
                                    card.subtitle,
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () => _openCardMenu(card),
                              icon: const Icon(
                                Icons.more_vert_rounded,
                                color: AppColors.textMuted,
                                size: 18,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Bottom Navigation Bar
            MausamBottomNavBar(
              currentIndex: _currentNavIndex,
              onTap: _onBottomNavTapped,
            ),
          ],
        ),
      ),
    );
  }
}
