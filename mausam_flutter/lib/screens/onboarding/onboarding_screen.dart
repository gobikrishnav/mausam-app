import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../widgets/common/india_gate_illustration.dart';
import '../interest_selection/interest_selection_screen.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  void _navigateToInterests(BuildContext context) {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const InterestSelectionScreen(),
        transitionsBuilder: (_, animation, __, child) =>
            SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(1.0, 0.0),
                end: Offset.zero,
              ).animate(CurvedAnimation(parent: animation, curve: Curves.easeInOut)),
              child: child,
            ),
        transitionDuration: const Duration(milliseconds: 350),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar: Skip Action
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: () => _navigateToInterests(context),
                  child: Text(
                    'Skip',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.navyPrimary,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Headline
              Text(
                'Reliable\nWeather Information\nfor a Better India',
                style: AppTypography.displayLarge.copyWith(
                  fontSize: 27,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navyPrimary,
                  height: 1.25,
                ),
              ),

              const SizedBox(height: 12),

              // Subtitle
              Text(
                'Get accurate, location-specific forecasts and alerts from the India Meteorological Department.',
                style: AppTypography.bodyMedium.copyWith(
                  fontSize: 13.5,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),

              const Spacer(),

              // India Gate Monument Illustration
              const ClipRRect(
                borderRadius: BorderRadius.all(Radius.circular(20)),
                child: IndiaGateIllustration(height: 250),
              ),

              const Spacer(),

              // Bottom Navigation & Indicator Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // 4-dot indicator (Step 1 active)
                  Row(
                    children: [
                      _buildDot(isActive: true),
                      const SizedBox(width: 6),
                      _buildDot(isActive: false),
                      const SizedBox(width: 6),
                      _buildDot(isActive: false),
                      const SizedBox(width: 6),
                      _buildDot(isActive: false),
                    ],
                  ),

                  // Circular Navy Next Button
                  GestureDetector(
                    onTap: () => _navigateToInterests(context),
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.navyPrimary,
                        boxShadow: [
                          BoxShadow(
                            color: Color(0x26082046),
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDot({required bool isActive}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: isActive ? 18 : 6,
      height: 6,
      decoration: BoxDecoration(
        color: isActive ? AppColors.navyPrimary : AppColors.cardBorder,
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}
