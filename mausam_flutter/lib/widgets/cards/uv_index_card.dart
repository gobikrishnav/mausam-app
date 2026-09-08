import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';

class UvIndexCard extends StatelessWidget {
  final WeatherCardModel card;
  final VoidCallback onTap;
  final VoidCallback onMenuTap;

  const UvIndexCard({
    super.key,
    required this.card,
    required this.onTap,
    required this.onMenuTap,
  });

  @override
  Widget build(BuildContext context) {
    final value = card.data['value'] ?? 3;
    final status = card.data['status'] ?? 'Moderate';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.cardBorder, width: 1),
          boxShadow: const [
            BoxShadow(
              color: Color(0x08000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Icon + Title + Menu
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.wb_sunny_outlined,
                      color: AppColors.warningAmber,
                      size: 18,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'UV Index',
                      style: AppTypography.h3.copyWith(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.navyPrimary,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: onMenuTap,
                  child: const Icon(
                    Icons.more_vert_rounded,
                    color: AppColors.textMuted,
                    size: 18,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // UV Index Value & Status
            Text(
              '$value',
              style: AppTypography.displayMedium.copyWith(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.navyPrimary,
                height: 1.0,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              status,
              style: AppTypography.caption.copyWith(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.warningAmber,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
