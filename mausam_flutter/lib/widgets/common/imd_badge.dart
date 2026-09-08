import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';

class ImdBadge extends StatelessWidget {
  final double size;
  final bool showText;

  const ImdBadge({
    super.key,
    this.size = 64,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // IMD Emblem Seal
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            border: Border.all(color: AppColors.cardBorder, width: 1.5),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0D082046),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(4),
          child: CustomPaint(
            painter: _ImdCrestPainter(),
          ),
        ),
        if (showText) ...[
          const SizedBox(height: 8),
          Text(
            AppConstants.imdTitleHi,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.navyPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            AppConstants.imdTitleEn,
            style: AppTypography.caption.copyWith(
              color: AppColors.navySecondary,
            ),
          ),
        ],
      ],
    );
  }
}

class _ImdCrestPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Deep blue background circle
    final bgPaint = Paint()..color = AppColors.navyPrimary;
    canvas.drawCircle(center, radius - 2, bgPaint);

    // Outer golden ring
    final goldPaint = Paint()
      ..color = const Color(0xFFFFD54F)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawCircle(center, radius - 4, goldPaint);

    // Radiant Sun in upper right
    final sunPaint = Paint()..color = const Color(0xFFFFD54F);
    canvas.drawCircle(Offset(center.dx + radius * 0.25, center.dy - radius * 0.25), radius * 0.3, sunPaint);

    // Fluffy cloud in center
    final cloudPaint = Paint()..color = Colors.white;
    final cloudPath = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(center.dx, center.dy + radius * 0.1), width: radius * 1.1, height: radius * 0.45),
        Radius.circular(radius * 0.2),
      ))
      ..addOval(Rect.fromCircle(center: Offset(center.dx - radius * 0.2, center.dy), radius: radius * 0.28))
      ..addOval(Rect.fromCircle(center: Offset(center.dx + radius * 0.15, center.dy - radius * 0.08), radius: radius * 0.24));
    canvas.drawPath(cloudPath, cloudPaint);

    // Raindrops below
    final rainPaint = Paint()
      ..color = const Color(0xFF00B0FF)
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final yStart = center.dy + radius * 0.38;
    canvas.drawLine(Offset(center.dx - radius * 0.3, yStart), Offset(center.dx - radius * 0.38, yStart + 8), rainPaint);
    canvas.drawLine(Offset(center.dx, yStart), Offset(center.dx - radius * 0.08, yStart + 8), rainPaint);
    canvas.drawLine(Offset(center.dx + radius * 0.3, yStart), Offset(center.dx + radius * 0.22, yStart + 8), rainPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
