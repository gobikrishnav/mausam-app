import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';

class GovernmentEmblem extends StatelessWidget {
  final double size;
  final bool showText;

  const GovernmentEmblem({
    super.key,
    this.size = 56,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Stylized Ashoka Lion Capital vector container
        Container(
          width: size,
          height: size,
          padding: const EdgeInsets.all(4),
          child: CustomPaint(
            painter: _AshokaEmblemPainter(),
          ),
        ),
        if (showText) ...[
          const SizedBox(height: 6),
          Text(
            AppConstants.govIndiaHi,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.navyPrimary,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            AppConstants.govIndiaEn,
            style: AppTypography.caption.copyWith(
              color: AppColors.navySecondary,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ],
    );
  }
}

class _AshokaEmblemPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.navyPrimary
      ..style = PaintingStyle.fill;

    final w = size.width;
    final h = size.height;

    // Pedestal Base
    final baseRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.15, h * 0.78, w * 0.7, h * 0.12),
      const Radius.circular(2),
    );
    canvas.drawRRect(baseRect, paint);

    // Ashoka Chakra circle on pedestal
    final chakraPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(Offset(w * 0.5, h * 0.84), w * 0.05, chakraPaint);

    // Three Lions silhouette representation
    // Center Lion Head & Mane
    final centerPath = Path()
      ..moveTo(w * 0.38, h * 0.75)
      ..lineTo(w * 0.38, h * 0.35)
      ..quadraticBezierTo(w * 0.38, h * 0.15, w * 0.5, h * 0.12)
      ..quadraticBezierTo(w * 0.62, h * 0.15, w * 0.62, h * 0.35)
      ..lineTo(w * 0.62, h * 0.75)
      ..close();
    canvas.drawPath(centerPath, paint);

    // Left Lion
    final leftPath = Path()
      ..moveTo(w * 0.22, h * 0.75)
      ..lineTo(w * 0.22, h * 0.42)
      ..quadraticBezierTo(w * 0.24, h * 0.25, w * 0.38, h * 0.28)
      ..lineTo(w * 0.38, h * 0.75)
      ..close();
    canvas.drawPath(leftPath, paint);

    // Right Lion
    final rightPath = Path()
      ..moveTo(w * 0.78, h * 0.75)
      ..lineTo(w * 0.78, h * 0.42)
      ..quadraticBezierTo(w * 0.76, h * 0.25, w * 0.62, h * 0.28)
      ..lineTo(w * 0.62, h * 0.75)
      ..close();
    canvas.drawPath(rightPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
