import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';

class BestOutdoorWindowCard extends StatelessWidget {
  final WeatherCardModel card;
  final VoidCallback onTap;
  final VoidCallback onMenuTap;

  const BestOutdoorWindowCard({
    super.key,
    required this.card,
    required this.onTap,
    required this.onMenuTap,
  });

  @override
  Widget build(BuildContext context) {
    final timeWindow = card.data['timeWindow'] ?? '6:30 AM – 7:30 AM';
    final status = card.data['status'] ?? 'Excellent conditions';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.cardBorder, width: 1),
          boxShadow: const [
            BoxShadow(
              color: Color(0x08000000),
              blurRadius: 10,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Green Runner Icon Badge
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.successGreenBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.successGreenBorder, width: 1),
              ),
              child: const Icon(
                Icons.directions_run_rounded,
                color: AppColors.successGreen,
                size: 24,
              ),
            ),
            const SizedBox(width: 14),

            // Card Text Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    card.title,
                    style: AppTypography.h3.copyWith(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.navyPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    timeWindow,
                    style: AppTypography.bodySmall.copyWith(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    status,
                    style: AppTypography.caption.copyWith(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.successGreen,
                    ),
                  ),
                ],
              ),
            ),

            // 3-dots menu button
            IconButton(
              onPressed: onMenuTap,
              icon: const Icon(
                Icons.more_vert_rounded,
                color: AppColors.textMuted,
                size: 20,
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              splashRadius: 18,
            ),
          ],
        ),
      ),
    );
  }
}
