import 'package:flutter/material.dart';

class IndiaGateIllustration extends StatelessWidget {
  final double height;

  const IndiaGateIllustration({super.key, this.height = 240});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(
        painter: _IndiaGatePainter(),
      ),
    );
  }
}

class _IndiaGatePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final cx = w / 2;

    // 1. Soft atmospheric gradient background
    final bgRect = Rect.fromLTWH(0, 0, w, h);
    final bgPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFFF1F5F9),
          Color(0xFFFDE8D0), // Warm sunrise haze
          Color(0xFFE2E8F0),
        ],
        stops: [0.0, 0.65, 1.0],
      ).createShader(bgRect);
    canvas.drawRect(bgRect, bgPaint);

    // 2. Distant Trees & Foliage Silhouette
    final treePaint = Paint()
      ..color = const Color(0xFF64748B).withOpacity(0.35)
      ..style = PaintingStyle.fill;

    for (double x = 0; x < w; x += 22) {
      canvas.drawCircle(Offset(x + 10, h * 0.85), 18, treePaint);
    }

    final foregroundTreePaint = Paint()
      ..color = const Color(0xFF475569).withOpacity(0.5)
      ..style = PaintingStyle.fill;
    for (double x = 10; x < w; x += 30) {
      canvas.drawCircle(Offset(x, h * 0.90), 22, foregroundTreePaint);
    }

    // 3. India Gate Monument (Sandstone Tones)
    final stoneBase = Paint()..color = const Color(0xFFC49A70); // Warm sandstone
    final stoneDark = Paint()..color = const Color(0xFFA87E56);
    final stoneLight = Paint()..color = const Color(0xFFDDB892);

    final gateW = w * 0.42;
    final gateH = h * 0.62;
    final gateX = cx - gateW / 2;
    final gateY = h * 0.32;

    // Monument Base steps
    canvas.drawRect(Rect.fromLTWH(gateX - 10, gateY + gateH - 8, gateW + 20, 8), stoneDark);
    canvas.drawRect(Rect.fromLTWH(gateX - 6, gateY + gateH - 16, gateW + 12, 8), stoneBase);

    // Main Columns/Pillars Body
    canvas.drawRect(Rect.fromLTWH(gateX, gateY + gateH * 0.28, gateW, gateH * 0.68), stoneBase);

    // Central Archway cutout (Dark shaded hollow)
    final archW = gateW * 0.38;
    final archH = gateH * 0.52;
    final archX = cx - archW / 2;
    final archY = gateY + gateH - archH - 16;

    final archPath = Path()
      ..moveTo(archX, archY + archH)
      ..lineTo(archX, archY + archW / 2)
      ..arcToPoint(
        Offset(archX + archW, archY + archW / 2),
        radius: Radius.circular(archW / 2),
        clockwise: true,
      )
      ..lineTo(archX + archW, archY + archH)
      ..close();

    final archShadowPaint = Paint()..color = const Color(0xFF5A3E26).withOpacity(0.85);
    canvas.drawPath(archPath, archShadowPaint);

    // Archway Stone Molding trim
    final moldingPaint = Paint()
      ..color = const Color(0xFFDDB892)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawPath(archPath, moldingPaint);

    // Monument Upper Cornice & Frieze
    canvas.drawRect(Rect.fromLTWH(gateX - 4, gateY + gateH * 0.22, gateW + 8, 10), stoneDark);
    canvas.drawRect(Rect.fromLTWH(gateX - 8, gateY + gateH * 0.16, gateW + 16, 8), stoneBase);

    // Attic Story (Top block with inscription panel)
    canvas.drawRect(Rect.fromLTWH(gateX + gateW * 0.08, gateY + 6, gateW * 0.84, gateH * 0.16), stoneLight);

    // Top Dome / Bowl finial
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx - 16, gateY - 4, 32, 10),
        const Radius.circular(4),
      ),
      stoneDark,
    );

    // 4. Flying Birds in Sky (Silhouettes)
    final birdPaint = Paint()
      ..color = const Color(0xFF475569)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.4;

    void drawBird(double bx, double by, double bsize) {
      final bp = Path()
        ..moveTo(bx - bsize, by)
        ..quadraticBezierTo(bx - bsize * 0.5, by - bsize * 0.7, bx, by)
        ..quadraticBezierTo(bx + bsize * 0.5, by - bsize * 0.7, bx + bsize, by);
      canvas.drawPath(bp, birdPaint);
    }

    drawBird(w * 0.22, h * 0.22, 6);
    drawBird(w * 0.28, h * 0.18, 8);
    drawBird(w * 0.75, h * 0.25, 6);
    drawBird(w * 0.82, h * 0.29, 5);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
