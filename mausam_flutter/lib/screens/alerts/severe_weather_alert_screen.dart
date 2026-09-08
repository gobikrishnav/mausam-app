import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/severe_alert_model.dart';

class SevereWeatherAlertScreen extends StatelessWidget {
  final SevereAlertModel? alert;

  const SevereWeatherAlertScreen({super.key, this.alert});

  @override
  Widget build(BuildContext context) {
    final activeAlert = alert ?? SevereAlertModel.sample;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: AppColors.navyPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Weather Alert',
          style: AppTypography.h3.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.navyPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            color: AppColors.navyPrimary,
            tooltip: 'Share alert',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Alert link copied to clipboard',
                    style: AppTypography.bodySmall.copyWith(color: Colors.white),
                  ),
                  backgroundColor: AppColors.navyPrimary,
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Red Alert Banner Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.alertRedBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.alertRedBorder, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge: Icon + Severity + Source
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.alertRed,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.warning_amber_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'SEVERE WEATHER ALERT',
                              style: AppTypography.overline.copyWith(
                                color: AppColors.alertRed,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                              ),
                            ),
                            Text(
                              activeAlert.source,
                              style: AppTypography.caption.copyWith(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Main Alert Title
                    Text(
                      activeAlert.title,
                      style: AppTypography.h2.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.navyPrimary,
                        height: 1.35,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Timing Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.alertRedBorder),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.access_time_rounded, size: 15, color: AppColors.alertRed),
                          const SizedBox(width: 6),
                          Text(
                            activeAlert.validWindow,
                            style: AppTypography.caption.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.alertRed,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Doppler Radar Map Preview
              Text(
                'Radar Precipitation Forecast',
                style: AppTypography.h3.copyWith(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.navyPrimary,
                ),
              ),
              const SizedBox(height: 8),

              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    // Base Map Painter (Coastline + City Grid + Roads)
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _ChennaiRadarMapPainter(),
                      ),
                    ),

                    // Top label chip
                    Positioned(
                      left: 12,
                      top: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.navyPrimary.withOpacity(0.85),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'IMD Doppler Radar • Chennai',
                          style: AppTypography.caption.copyWith(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),

                    // Bottom 'View Full Map' link
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(color: Color(0x1F000000), blurRadius: 4),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Interactive Map',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.navyPrimary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppColors.navyPrimary),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Safety Recommendations Checklist
              Text(
                'Safety Recommendations',
                style: AppTypography.h3.copyWith(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.navyPrimary,
                ),
              ),
              const SizedBox(height: 12),

              ...activeAlert.safetyTips.asMap().entries.map((entry) {
                final index = entry.key + 1;
                final tip = entry.value;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Center(
                          child: Text(
                            '$index',
                            style: AppTypography.caption.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.navyPrimary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          tip,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),

              const SizedBox(height: 16),

              // Official IMD Helpline Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.call_rounded, color: AppColors.navyPrimary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'State Disaster Helpline: 1070',
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.navyPrimary,
                            ),
                          ),
                          Text(
                            'IMD Regional Weather Desk: 044-22561594',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action Buttons
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Alert shared with your contacts',
                        style: AppTypography.bodySmall.copyWith(color: Colors.white),
                      ),
                      backgroundColor: AppColors.navyPrimary,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                icon: const Icon(Icons.share_rounded, size: 18),
                label: Text(
                  'Share Alert with Family',
                  style: AppTypography.buttonMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.navyPrimary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChennaiRadarMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Landmass background (light slate gray/cream)
    final landPaint = Paint()..color = const Color(0xFFF1F5F9);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), landPaint);

    // Ocean (Bay of Bengal) on the east (right side)
    final oceanPaint = Paint()..color = const Color(0xFFBAE6FD);
    final coastlinePath = Path()
      ..moveTo(size.width * 0.72, 0)
      ..quadraticBezierTo(size.width * 0.70, size.height * 0.4, size.width * 0.75, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.78, size.height * 0.85, size.width * 0.74, size.height)
      ..lineTo(size.width, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(coastlinePath, oceanPaint);

    // Road Grid lines
    final roadPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0;

    canvas.drawLine(Offset(0, size.height * 0.35), Offset(size.width * 0.72, size.height * 0.38), roadPaint);
    canvas.drawLine(Offset(0, size.height * 0.65), Offset(size.width * 0.75, size.height * 0.65), roadPaint);
    canvas.drawLine(Offset(size.width * 0.35, 0), Offset(size.width * 0.40, size.height), roadPaint);

    // River Cooum & Adyar
    final riverPaint = Paint()
      ..color = const Color(0xFF93C5FD)
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    final riverPath = Path()
      ..moveTo(0, size.height * 0.45)
      ..quadraticBezierTo(size.width * 0.3, size.height * 0.48, size.width * 0.72, size.height * 0.44);
    canvas.drawPath(riverPath, riverPaint);

    // Severe Radar Precipitation Polygon Overlay (translucent red and orange zones)
    final outerRadarPaint = Paint()
      ..color = const Color(0xFFFB923C).withOpacity(0.4) // Orange outer rain
      ..style = PaintingStyle.fill;

    final innerRadarPaint = Paint()
      ..color = const Color(0xFFEF4444).withOpacity(0.55) // Red severe core
      ..style = PaintingStyle.fill;

    final radarBorderPaint = Paint()
      ..color = const Color(0xFFDC2626)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;

    // Outer polygon
    final outerPath = Path()
      ..moveTo(size.width * 0.15, size.height * 0.25)
      ..lineTo(size.width * 0.55, size.height * 0.18)
      ..lineTo(size.width * 0.68, size.height * 0.52)
      ..lineTo(size.width * 0.48, size.height * 0.75)
      ..lineTo(size.width * 0.18, size.height * 0.60)
      ..close();
    canvas.drawPath(outerPath, outerRadarPaint);

    // Inner severe core polygon
    final innerPath = Path()
      ..moveTo(size.width * 0.25, size.height * 0.35)
      ..lineTo(size.width * 0.50, size.height * 0.30)
      ..lineTo(size.width * 0.58, size.height * 0.55)
      ..lineTo(size.width * 0.35, size.height * 0.62)
      ..close();
    canvas.drawPath(innerPath, innerRadarPaint);
    canvas.drawPath(innerPath, radarBorderPaint);

    // Location pin for Chennai center
    final pinPaint = Paint()..color = AppColors.navyPrimary;
    canvas.drawCircle(Offset(size.width * 0.42, size.height * 0.44), 5, pinPaint);
    final pinBorder = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(Offset(size.width * 0.42, size.height * 0.44), 5, pinBorder);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
