import '../models/weather_card_model.dart';
import '../models/user_profile_model.dart';
import '../models/feedback_event_model.dart';

class PersonalizationEngine {
  static final PersonalizationEngine _instance = PersonalizationEngine._internal();
  factory PersonalizationEngine() => _instance;
  PersonalizationEngine._internal();

  // Active User Profile
  UserProfileModel currentUser = UserProfileModel(
    id: 'user_saran',
    name: 'Saran Raja',
    email: 'saran@example.com',
    location: 'Chennai, Tamil Nadu',
    selectedInterests: {'Fitness', 'Travel'},
    pinnedCardIds: ['overview', 'best_outdoor_window', 'aqi'],
  );

  final List<FeedbackEvent> _feedbackEvents = [];

  List<WeatherCardModel> getInitialCards() {
    return [
      WeatherCardModel(
        id: 'overview',
        type: WeatherCardType.overview,
        title: 'Weather Overview',
        subtitle: '29°C Partly Cloudy',
        category: 'General',
        score: 1.0,
        isPinned: true,
        data: {
          'temp': 29,
          'condition': 'Partly Cloudy',
          'feelsLike': 31,
          'maxTemp': 32,
          'minTemp': 25,
          'humidity': 72,
          'windSpeed': 12,
          'date': 'Tue, 10 Sep',
        },
        explanation: [
          'Primary meteorological observation for your current location',
          'Standard IMD synoptic station report',
        ],
      ),
      WeatherCardModel(
        id: 'best_outdoor_window',
        type: WeatherCardType.bestOutdoorWindow,
        title: 'Best Outdoor Window',
        subtitle: 'Ideal time for outdoor activities',
        category: 'Fitness',
        score: 0.95,
        isPinned: true,
        data: {
          'timeWindow': '6:30 AM – 7:30 AM',
          'status': 'Excellent conditions',
          'score': 92,
          'temperature': 23,
          'rainChance': 20,
          'wind': 12,
          'whyText': 'Pleasant temperature, low humidity and good air quality make this ideal for outdoor activities.',
        },
        explanation: [
          'You selected Fitness as an interest',
          'You often check outdoor activity conditions',
          'Weather conditions are favourable today',
          'Good air quality in your area',
        ],
      ),
      WeatherCardModel(
        id: 'aqi',
        type: WeatherCardType.aqi,
        title: 'AQI',
        subtitle: 'Air Quality Index',
        category: 'Health',
        score: 0.90,
        isPinned: true,
        data: {
          'value': 42,
          'status': 'Good',
          'category': 'Satisfactory',
          'pm25': 18,
          'pm10': 32,
        },
        explanation: [
          'Daily health safety metric',
          'Air quality is in the safe zone today',
        ],
      ),
      WeatherCardModel(
        id: 'uv_index',
        type: WeatherCardType.uvIndex,
        title: 'UV Index',
        subtitle: 'Solar Radiation Level',
        category: 'Health',
        score: 0.85,
        isPinned: false,
        data: {
          'value': 3,
          'status': 'Moderate',
          'protectionNeeded': 'Sun protection recommended during midday',
        },
        explanation: [
          'Useful for morning and midday outdoor planning',
          'Current solar irradiance requires standard precautions',
        ],
      ),
      WeatherCardModel(
        id: 'hourly_forecast',
        type: WeatherCardType.hourlyForecast,
        title: 'Hourly Forecast',
        subtitle: 'Next 24-hour weather curve',
        category: 'General',
        score: 0.80,
        isPinned: false,
        data: {},
        explanation: [
          'Detailed diurnal cycle forecast for Chennai',
        ],
      ),
      WeatherCardModel(
        id: 'travel_conditions',
        type: WeatherCardType.travelConditions,
        title: 'Travel Conditions',
        subtitle: 'Highway and transit outlook',
        category: 'Travel',
        score: 0.78,
        isPinned: false,
        data: {
          'visibility': 'Good (8 km)',
          'roadConditions': 'Wet surfaces expected post 4 PM',
        },
        explanation: [
          'You selected Travel as an interest',
          'Monitors route safety ahead of afternoon precipitation',
        ],
      ),
      WeatherCardModel(
        id: 'soil_moisture',
        type: WeatherCardType.soilMoisture,
        title: 'Soil Moisture',
        subtitle: 'Root zone moisture level',
        category: 'Farming',
        score: 0.65,
        isPinned: false,
        data: {
          'moisture': '68%',
          'status': 'Optimal for sowing',
        },
        explanation: [
          'Relevant for agro-meteorological monitoring',
        ],
      ),
      WeatherCardModel(
        id: 'family_commute',
        type: WeatherCardType.familyCommute,
        title: 'Family Commute',
        subtitle: 'School & transit window',
        category: 'Family',
        score: 0.60,
        isPinned: false,
        data: {
          'morningWindow': 'Clear (7:30 AM - 9:00 AM)',
          'eveningWindow': 'Rain likely (4:30 PM - 6:00 PM)',
        },
        explanation: [
          'Helps plan school and commute runs around rain forecasts',
        ],
      ),
    ];
  }

  // Get dynamically ranked cards for the single homepage
  List<WeatherCardModel> getRankedHomepageCards() {
    final allCards = getInitialCards();

    // 1. Filter hidden cards
    final visibleCards = allCards.where((c) => !currentUser.hiddenCardIds.contains(c.id)).toList();

    // 2. Adjust scores based on selected interests
    for (var card in visibleCards) {
      if (currentUser.selectedInterests.contains(card.category)) {
        card.score += 0.3; // Boost matching interests
      }
      if (currentUser.pinnedCardIds.contains(card.id)) {
        card.isPinned = true;
      }
    }

    // 3. Sort by: Pinned first, then by Score descending
    visibleCards.sort((a, b) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.score.compareTo(a.score);
    });

    return visibleCards;
  }

  // Record user feedback
  void recordFeedback(String cardId, FeedbackEventType type, {Map<String, dynamic>? meta}) {
    _feedbackEvents.add(FeedbackEvent(cardId: cardId, eventType: type, metadata: meta));

    if (type == FeedbackEventType.cardPin) {
      if (!currentUser.pinnedCardIds.contains(cardId)) {
        currentUser.pinnedCardIds.add(cardId);
      }
    } else if (type == FeedbackEventType.cardUnpin) {
      currentUser.pinnedCardIds.remove(cardId);
    } else if (type == FeedbackEventType.cardHide) {
      if (!currentUser.hiddenCardIds.contains(cardId)) {
        currentUser.hiddenCardIds.add(cardId);
      }
    }
  }

  void updateInterests(Set<String> newInterests) {
    currentUser = currentUser.copyWith(selectedInterests: newInterests);
  }

  void updatePinnedOrder(List<String> pinnedIds) {
    currentUser = currentUser.copyWith(pinnedCardIds: pinnedIds);
  }
}
