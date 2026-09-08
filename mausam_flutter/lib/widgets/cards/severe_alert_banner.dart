import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/severe_alert_model.dart';

class SevereAlertBanner extends StatelessWidget {
  final SevereAlertModel? alert;
  final String? message;
  final VoidCallback onTap;

  const SevereAlertBanner({
    super.key,
    this.alert,
    this.message,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bannerTitle = message ?? alert?.bannerNotice ?? 'Rain expected in 2 hours';
    final bannerSub = alert?.bannerNoticeSub ?? 'Regional Meteorological Centre advisory';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.severeRedBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.severeRedBorder, width: 1),
          boxShadow: const [
            BoxShadow(
              color: Color(0x08DC2626),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Red Warning Icon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.severeRed.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                color: AppColors.severeRed,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),

            // Alert Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    bannerTitle,
                    style: AppTypography.bodyLarge.copyWith(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.severeRed,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    bannerSub,
                    style: AppTypography.caption.copyWith(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      height: 1.2,
                    ),
                  ),
                ],
              ),
            ),

            // Right Chevron
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.severeRed,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
