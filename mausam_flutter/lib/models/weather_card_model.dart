enum WeatherCardType {
  overview,
  bestOutdoorWindow,
  aqi,
  uvIndex,
  hourlyForecast,
  travelConditions,
  soilMoisture,
  familyCommute,
  rainfallForecast,
  frostAlert,
  coastalTides,
  packingSuggestions,
  routeForecast,
  pollenAllergy,
}

class WeatherCardModel {
  final String id;
  final WeatherCardType type;
  final String title;
  final String subtitle;
  final String category;
  double score; // ML recommendation score (0.0 - 1.0)
  int priority; // User sorting priority
  bool isPinned;
  bool isHidden;
  final Map<String, dynamic> data;
  final List<String> explanation;

  WeatherCardModel({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.category,
    this.score = 0.5,
    this.priority = 0,
    this.isPinned = false,
    this.isHidden = false,
    required this.data,
    required this.explanation,
  });

  WeatherCardModel copyWith({
    String? id,
    WeatherCardType? type,
    String? title,
    String? subtitle,
    String? category,
    double? score,
    int? priority,
    bool? isPinned,
    bool? isHidden,
    Map<String, dynamic>? data,
    List<String>? explanation,
  }) {
    return WeatherCardModel(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      category: category ?? this.category,
      score: score ?? this.score,
      priority: priority ?? this.priority,
      isPinned: isPinned ?? this.isPinned,
      isHidden: isHidden ?? this.isHidden,
      data: data ?? this.data,
      explanation: explanation ?? this.explanation,
    );
  }
}
