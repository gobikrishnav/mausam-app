import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/tricolor_painter.dart';
import '../../widgets/common/government_emblem.dart';
import '../../widgets/common/imd_badge.dart';
import '../onboarding/onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _controller.forward();

    // Auto-advance after 2.5 seconds
    _timer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const OnboardingScreen(),
            transitionsBuilder: (_, animation, __, child) =>
                FadeTransition(opacity: animation, child: child),
            transitionDuration: const Duration(milliseconds: 600),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 1. Top Section: Government of India Emblem
              Padding(
                padding: const EdgeInsets.only(top: 24),
                child: const GovernmentEmblem(size: 52),
              ),

              // 2. Middle Section: IMD Crest & App Identity
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const ImdBadge(size: 72),
                  const SizedBox(height: 28),
                  Text(
                    AppConstants.appName,
                    style: AppTypography.displayLarge.copyWith(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      color: AppColors.navyPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    AppConstants.appTaglineEn,
                    style: AppTypography.bodyMedium.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.navySecondary,
                    ),
                  ),
                ],
              ),

              // 3. Bottom Section: Tricolor Curve & Motto
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Tricolor swoosh painter
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: CustomPaint(
                      painter: TricolorPainter(strokeWidth: 4.5, isCurved: true),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    AppConstants.appTaglineHi,
                    style: AppTypography.h3.copyWith(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navyPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    AppConstants.appSubTagline,
                    style: AppTypography.caption.copyWith(
                      fontSize: 11,
                      color: AppColors.textMuted,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
