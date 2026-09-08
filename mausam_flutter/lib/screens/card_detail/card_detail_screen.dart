import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';
import '../../models/feedback_event_model.dart';
import '../../services/personalization_engine.dart';
import '../../widgets/common/circular_score_gauge.dart';
import '../card_menu/card_menu_sheet.dart';

class CardDetailScreen extends StatefulWidget {
  final WeatherCardModel card;

  const CardDetailScreen({
    super.key,
    required this.card,
  });

  @override
  State<CardDetailScreen> createState() => _CardDetailScreenState();
}

class _CardDetailScreenState extends State<CardDetailScreen> {
  bool? _isHelpful;

  void _onFeedback(bool helpful) {
    setState(() {
      _isHelpful = helpful;
    });

    PersonalizationEngine().recordFeedback(
      widget.card.id,
      helpful ? FeedbackEventType.cardFeedbackPositive : FeedbackEventType.cardFeedbackNegative,
      meta: {'timestamp': DateTime.now().toIso8601String()},
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          helpful
              ? 'Thank you! We\'ll keep showing similar recommendations.'
              : 'Feedback received. We\'ll refine your recommendations.',
          style: AppTypography.bodySmall.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.navyPrimary,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final timeWindow = widget.card.data['timeWindow'] ?? '6:30 AM – 7:30 AM';
    final score = widget.card.data['score'] ?? 92;
    final temp = widget.card.data['temperature'] ?? 23;
    final rainChance = widget.card.data['rainChance'] ?? 20;
    final wind = widget.card.data['wind'] ?? 12;
    final whyText = widget.card.data['whyText'] ??
        'Pleasant temperature, low humidity and good air quality make this ideal for outdoor activities.';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: AppColors.navyPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Recommendation Detail',
          style: AppTypography.h3.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.navyPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            color: AppColors.navyPrimary,
            onPressed: () => CardMenuSheet.show(
              context,
              card: widget.card,
              onPinChanged: () => setState(() {}),
              onCardHidden: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Illustration Header
            _buildHeroImageBanner(),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title Block with Runner Badge
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.successGreenBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.successGreenBorder),
                        ),
                        child: const Icon(
                          Icons.directions_run_rounded,
                          color: AppColors.successGreen,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.card.title,
                              style: AppTypography.h2.copyWith(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.navyPrimary,
                              ),
                            ),
                            Text(
                              widget.card.subtitle,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Score & Time Row Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Time Window & Status
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'BEST WINDOW',
                              style: AppTypography.overline.copyWith(
                                color: AppColors.textMuted,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              timeWindow,
                              style: AppTypography.h3.copyWith(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.navyPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppColors.successGreen,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Excellent conditions',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.successGreen,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        // Circular Gauge Score
                        CircularScoreGauge(
                          score: score,
                          maxScore: 100,
                          size: 72,
                          strokeWidth: 6,
                          label: 'Score',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Weather Metrics 3-Item Row
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricTile(
                          icon: Icons.thermostat_outlined,
                          title: 'Temperature',
                          value: '$temp°C',
                          color: AppColors.navyPrimary,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricTile(
                          icon: Icons.umbrella_outlined,
                          title: 'Rain Chance',
                          value: '$rainChance%',
                          color: const Color(0xFF2B82E8),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildMetricTile(
                          icon: Icons.air_rounded,
                          title: 'Wind Speed',
                          value: '$wind km/h',
                          color: const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // "Why this is a good time?" Card
                  Text(
                    'Why this is a good time?',
                    style: AppTypography.h3.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navyPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Text(
                      whyText,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.45,
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Interactive Feedback Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Was this recommendation useful?',
                          style: AppTypography.h3.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.navyPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Mausam learns from your choices to improve future suggestions.',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 14),

                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _onFeedback(true),
                                icon: Icon(
                                  Icons.thumb_up_alt_rounded,
                                  size: 16,
                                  color: _isHelpful == true
                                      ? Colors.white
                                      : AppColors.successGreen,
                                ),
                                label: Text(
                                  'Helpful',
                                  style: AppTypography.buttonSmall.copyWith(
                                    color: _isHelpful == true
                                        ? Colors.white
                                        : AppColors.navyPrimary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: _isHelpful == true
                                      ? AppColors.successGreen
                                      : Colors.white,
                                  side: BorderSide(
                                    color: _isHelpful == true
                                        ? AppColors.successGreen
                                        : AppColors.cardBorder,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _onFeedback(false),
                                icon: Icon(
                                  Icons.thumb_down_alt_rounded,
                                  size: 16,
                                  color: _isHelpful == false
                                      ? Colors.white
                                      : AppColors.textMuted,
                                ),
                                label: Text(
                                  'Not useful',
                                  style: AppTypography.buttonSmall.copyWith(
                                    color: _isHelpful == false
                                        ? Colors.white
                                        : AppColors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  backgroundColor: _isHelpful == false
                                      ? const Color(0xFF64748B)
                                      : Colors.white,
                                  side: BorderSide(
                                    color: _isHelpful == false
                                        ? const Color(0xFF64748B)
                                        : AppColors.cardBorder,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 6),
          Text(
            title,
            style: AppTypography.caption.copyWith(
              fontSize: 10.5,
              color: AppColors.textMuted,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTypography.h3.copyWith(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.navyPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroImageBanner() {
    return Container(
      height: 180,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFFDBA74), // Warm sunrise amber
            Color(0xFFFED7AA),
            Color(0xFFFFF7ED),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Sun disc
          Positioned(
            right: 40,
            top: 25,
            child: Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color(0xFFFFedd5),
                    Color(0xFFF97316),
                  ],
                ),
              ),
            ),
          ),
          // Silhouette landscape painter
          Positioned.fill(
            child: CustomPaint(
              painter: _RunnerLandscapePainter(),
            ),
          ),
        ],
      ),
    );
  }
}

class _RunnerLandscapePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final hillPaint = Paint()
      ..color = const Color(0xFFC2410C).withOpacity(0.35)
      ..style = PaintingStyle.fill;

    // Distant soft hill
    final hillPath = Path()
      ..moveTo(0, size.height * 0.75)
      ..quadraticBezierTo(size.width * 0.3, size.height * 0.60, size.width * 0.6, size.height * 0.72)
      ..quadraticBezierTo(size.width * 0.85, size.height * 0.80, size.width, size.height * 0.68)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(hillPath, hillPaint);

    // Foreground track
    final trackPaint = Paint()
      ..color = const Color(0xFF9A3412).withOpacity(0.7)
      ..style = PaintingStyle.fill;

    final trackPath = Path()
      ..moveTo(0, size.height * 0.85)
      ..quadraticBezierTo(size.width * 0.5, size.height * 0.82, size.width, size.height * 0.88)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(trackPath, trackPaint);

    // Silhouette runner figure
    final runnerPaint = Paint()
      ..color = const Color(0xFF431407)
      ..style = PaintingStyle.fill;

    // Runner head
    canvas.drawCircle(Offset(size.width * 0.45, size.height * 0.72), 5, runnerPaint);

    // Runner body line
    final bodyPaint = Paint()
      ..color = const Color(0xFF431407)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(size.width * 0.45, size.height * 0.73),
      Offset(size.width * 0.44, size.height * 0.80),
      bodyPaint,
    );
    // Legs
    canvas.drawLine(
      Offset(size.width * 0.44, size.height * 0.80),
      Offset(size.width * 0.41, size.height * 0.87),
      bodyPaint,
    );
    canvas.drawLine(
      Offset(size.width * 0.44, size.height * 0.80),
      Offset(size.width * 0.48, size.height * 0.85),
      bodyPaint,
    );
    // Arms
    canvas.drawLine(
      Offset(size.width * 0.45, size.height * 0.75),
      Offset(size.width * 0.42, size.height * 0.77),
      bodyPaint,
    );
    canvas.drawLine(
      Offset(size.width * 0.45, size.height * 0.75),
      Offset(size.width * 0.48, size.height * 0.76),
      bodyPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
