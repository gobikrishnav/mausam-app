class SevereAlertModel {
  final String id;
  final String title;
  final String headline;
  final String timeWindow;
  final String description;
  final String affectedArea;
  final String bannerNotice;
  final String bannerNoticeSub;
  final List<String> safetyTips;
  final bool isActive;

  const SevereAlertModel({
    required this.id,
    required this.title,
    required this.headline,
    required this.timeWindow,
    required this.description,
    required this.affectedArea,
    required this.bannerNotice,
    required this.bannerNoticeSub,
    required this.safetyTips,
    this.isActive = true,
  });

  String get source => 'Regional Meteorological Centre, Chennai';
  String get validWindow => timeWindow.replaceAll('\n', ' ');

  static const SevereAlertModel sample = SevereAlertModel(
    id: 'imd_alert_chennai_01',
    title: 'Severe Weather Alert',
    headline: 'Heavy rainfall expected\nin Chennai and surrounding areas.',
    timeWindow: '4:00 PM – 7:00 PM\nToday',
    description: 'Intense rainfall with possible waterlogging. Avoid unnecessary travel and follow official advisories.',
    affectedArea: 'Chennai, Tamil Nadu',
    bannerNotice: 'Rain expected in 2 hours',
    bannerNoticeSub: 'Moderate to heavy rainfall likely in your area.',
    safetyTips: [
      'Avoid low-lying areas',
      'Keep an umbrella/raincoat',
      'Stay updated with IMD alerts',
      'Check commute routes',
    ],
    isActive: true,
  );
}
