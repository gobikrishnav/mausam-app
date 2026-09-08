import 'package:flutter/material.dart';
import '../../core/theme/app_typography.dart';

class HeroWeatherCard extends StatelessWidget {
  final Map<String, dynamic> weatherData;

  const HeroWeatherCard({
    super.key,
    required this.weatherData,
  });

  @override
  Widget build(BuildContext context) {
    final temp = weatherData['temp'] ?? 29;
    final condition = weatherData['condition'] ?? 'Partly Cloudy';
    final feelsLike = weatherData['feelsLike'] ?? 31;
    final maxTemp = weatherData['maxTemp'] ?? 32;
    final minTemp = weatherData['minTemp'] ?? 25;
    final humidity = weatherData['humidity'] ?? 72;
    final windSpeed = weatherData['windSpeed'] ?? 12;
    final date = weatherData['date'] ?? 'Tue, 10 Sep';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF337ACC),
            Color(0xFF5B9EEA),
          ],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A082046),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background tree silhouette in top-right corner
          Positioned(
            right: -10,
            top: -10,
            child: Opacity(
              opacity: 0.18,
              child: CustomPaint(
                size: const Size(120, 120),
                painter: _TreeSilhouettePainter(),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Weather Icon + Temp + Date
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Sun behind cloud icon + Temp
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        _buildSunCloudIcon(),
                        const SizedBox(width: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$temp°C',
                              style: AppTypography.displayLarge.copyWith(
                                color: Colors.white,
                                fontSize: 36,
                                height: 1.0,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              condition,
                              style: AppTypography.h3.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Feels like $feelsLike°C',
                              style: AppTypography.caption.copyWith(
                                color: Colors.white.withOpacity(0.85),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Date Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        date,
                        style: AppTypography.caption.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 18),
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 14),

                // Bottom Metrics Row: High, Low, Humidity, Wind
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMetric('↑', '$maxTemp°'),
                    _buildMetric('↓', '$minTemp°'),
                    _buildMetric('💧', '$humidity%'),
                    _buildMetric('💨', '$windSpeed km/h'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          icon,
          style: const TextStyle(fontSize: 13, color: Colors.white),
        ),
        const SizedBox(width: 4),
        Text(
          value,
          style: AppTypography.bodySmall.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildSunCloudIcon() {
    return SizedBox(
      width: 50,
      height: 50,
      child: Stack(
        children: [
          // Sun
          Positioned(
            left: 4,
            top: 2,
            child: Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFFD54F),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x66FFD54F),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),
          ),
          // Cloud
          Positioned(
            right: 0,
            bottom: 4,
            child: Container(
              width: 36,
              height: 24,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.92),
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1A000000),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TreeSilhouettePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    canvas.drawCircle(Offset(size.width * 0.7, size.height * 0.4), 35, paint);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.6), 28, paint);
    canvas.drawCircle(Offset(size.width * 0.85, size.height * 0.65), 24, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
