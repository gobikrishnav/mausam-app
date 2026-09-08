import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../services/personalization_engine.dart';
import '../home/home_screen.dart';

class InterestSelectionScreen extends StatefulWidget {
  const InterestSelectionScreen({super.key});

  @override
  State<InterestSelectionScreen> createState() => _InterestSelectionScreenState();
}

class _InterestSelectionScreenState extends State<InterestSelectionScreen> {
  // Initial selections matching reference (Fitness & Travel)
  final Set<String> _selected = {'Fitness', 'Travel'};

  final List<_InterestItem> _interests = const [
    _InterestItem(
      title: 'Fitness',
      subtitle: 'Outdoor activities',
      icon: Icons.directions_run_rounded,
      color: AppColors.iconFitness,
    ),
    _InterestItem(
      title: 'Travel',
      subtitle: 'Destinations',
      icon: Icons.flight_rounded,
      color: AppColors.iconTravel,
    ),
    _InterestItem(
      title: 'Farming',
      subtitle: 'Agriculture',
      icon: Icons.grass_rounded,
      color: AppColors.iconFarming,
    ),
    _InterestItem(
      title: 'Family',
      subtitle: 'Kids & elderly',
      icon: Icons.people_outline_rounded,
      color: AppColors.iconFamily,
    ),
    _InterestItem(
      title: 'Events',
      subtitle: 'Outdoor gatherings',
      icon: Icons.event_note_rounded,
      color: AppColors.iconEvents,
    ),
    _InterestItem(
      title: 'Coastal',
      subtitle: 'Tides & marine',
      icon: Icons.waves_rounded,
      color: AppColors.iconCoastal,
    ),
  ];

  void _toggleInterest(String title) {
    setState(() {
      if (_selected.contains(title)) {
        if (_selected.length > 1) {
          _selected.remove(title);
        }
      } else {
        if (_selected.length < 3) {
          _selected.add(title);
        }
      }
    });
  }

  void _handleContinue() {
    PersonalizationEngine().updateInterests(_selected);
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const HomeScreen(),
        transitionsBuilder: (_, animation, __, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar: Back Arrow + Segmented Progress Indicator
              Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                    color: AppColors.navyPrimary,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                  ),
                  const SizedBox(width: 12),

                  // 3-step progress bar (Step 1/3)
                  Expanded(
                    child: Row(
                      children: [
                        _buildStepBar(isFilled: true),
                        const SizedBox(width: 6),
                        _buildStepBar(isFilled: false),
                        const SizedBox(width: 6),
                        _buildStepBar(isFilled: false),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  Text(
                    '1/3',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Title
              Text(
                'What matters to you?',
                style: AppTypography.displayLarge.copyWith(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navyPrimary,
                ),
              ),

              const SizedBox(height: 8),

              // Subtitle
              Text(
                'Select 1–3 interests to personalize your experience. You can change this later.',
                style: AppTypography.bodyMedium.copyWith(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),

              const SizedBox(height: 24),

              // 2x3 Grid of Interest Cards
              Expanded(
                child: GridView.builder(
                  itemCount: _interests.length,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.18,
                  ),
                  itemBuilder: (context, index) {
                    final item = _interests[index];
                    final isSelected = _selected.contains(item.title);

                    return GestureDetector(
                      onTap: () => _toggleInterest(item.title),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFF0F6FE) : AppColors.surface,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isSelected ? AppColors.navyPrimary : AppColors.cardBorder,
                            width: isSelected ? 1.8 : 1.0,
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x06000000),
                              blurRadius: 6,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            // Selection Checkmark Badge in top right
                            if (isSelected)
                              const Positioned(
                                right: 0,
                                top: 0,
                                child: Icon(
                                  Icons.check_circle_rounded,
                                  color: AppColors.navyPrimary,
                                  size: 18,
                                ),
                              ),

                            // Content: Icon + Title + Subtitle
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(item.icon, color: item.color, size: 28),
                                const SizedBox(height: 10),
                                Text(
                                  item.title,
                                  style: AppTypography.h3.copyWith(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.navyPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item.subtitle,
                                  style: AppTypography.caption.copyWith(
                                    fontSize: 10.5,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Bottom Primary Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _selected.isNotEmpty ? _handleContinue : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navyPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(26),
                    ),
                  ),
                  child: Text(
                    'Continue',
                    style: AppTypography.button.copyWith(fontSize: 15),
                  ),
                ),
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepBar({required bool isFilled}) {
    return Expanded(
      child: Container(
        height: 4,
        decoration: BoxDecoration(
          color: isFilled ? AppColors.navyPrimary : AppColors.cardBorder,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}

class _InterestItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _InterestItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });
}
