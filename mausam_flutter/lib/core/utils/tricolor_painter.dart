import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class TricolorPainter extends CustomPainter {
  final double strokeWidth;
  final bool isCurved;

  TricolorPainter({this.strokeWidth = 6.0, this.isCurved = true});

  @override
  void paint(Canvas canvas, Size size) {
    if (isCurved) {
      _paintCurved(canvas, size);
    } else {
      _paintStraight(canvas, size);
    }
  }

  void _paintCurved(Canvas canvas, Size size) {
    final pathSaffron = Path();
    final pathWhite = Path();
    final pathGreen = Path();

    final width = size.width;
    final height = size.height;

    // Saffron curve
    final paintSaffron = Paint()
      ..color = AppColors.tricolorSaffron
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    pathSaffron.moveTo(0, height * 0.4);
    pathSaffron.cubicTo(
      width * 0.35, height * 0.7,
      width * 0.65, height * 0.1,
      width, height * 0.3,
    );
    canvas.drawPath(pathSaffron, paintSaffron);

    // White / subtle middle line
    final paintWhite = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth * 0.85
      ..strokeCap = StrokeCap.round;

    pathWhite.moveTo(0, height * 0.4 + strokeWidth + 1);
    pathWhite.cubicTo(
      width * 0.35, height * 0.7 + strokeWidth + 1,
      width * 0.65, height * 0.1 + strokeWidth + 1,
      width, height * 0.3 + strokeWidth + 1,
    );
    canvas.drawPath(pathWhite, paintWhite);

    // Green curve
    final paintGreen = Paint()
      ..color = AppColors.tricolorGreen
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    pathGreen.moveTo(0, height * 0.4 + (strokeWidth * 2) + 2);
    pathGreen.cubicTo(
      width * 0.35, height * 0.7 + (strokeWidth * 2) + 2,
      width * 0.65, height * 0.1 + (strokeWidth * 2) + 2,
      width, height * 0.3 + (strokeWidth * 2) + 2,
    );
    canvas.drawPath(pathGreen, paintGreen);
  }

  void _paintStraight(Canvas canvas, Size size) {
    final stripeHeight = size.height / 3;
    final paint = Paint()..style = PaintingStyle.fill;

    // Saffron
    paint.color = AppColors.tricolorSaffron;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, stripeHeight), paint);

    // White
    paint.color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(0, stripeHeight, size.width, stripeHeight), paint);

    // Green
    paint.color = AppColors.tricolorGreen;
    canvas.drawRect(Rect.fromLTWH(0, stripeHeight * 2, size.width, stripeHeight), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
