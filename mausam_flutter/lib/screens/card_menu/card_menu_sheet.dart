import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';
import '../../models/feedback_event_model.dart';
import '../../services/personalization_engine.dart';
import '../why_this_card/why_this_card_screen.dart';

class CardMenuSheet extends StatelessWidget {
  final WeatherCardModel card;
  final VoidCallback? onPinChanged;
  final VoidCallback? onCardHidden;

  const CardMenuSheet({
    super.key,
    required this.card,
    this.onPinChanged,
    this.onCardHidden,
  });

  static Future<void> show(
    BuildContext context, {
    required WeatherCardModel card,
    VoidCallback? onPinChanged,
    VoidCallback? onCardHidden,
  }) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => CardMenuSheet(
        card: card,
        onPinChanged: onPinChanged,
        onCardHidden: onCardHidden,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle pill
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.cardBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // 1. Pin / Unpin to homepage
            _buildActionItem(
              icon: Icons.push_pin_outlined,
              label: card.isPinned ? 'Unpin from homepage' : 'Pin to homepage',
              onTap: () {
                PersonalizationEngine().recordFeedback(
                  card.id,
                  card.isPinned ? FeedbackEventType.cardUnpin : FeedbackEventType.cardPin,
                );
                Navigator.pop(context);
                onPinChanged?.call();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(card.isPinned ? 'Card unpinned' : 'Card pinned to top'),
                    duration: const Duration(seconds: 2),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),

            // 2. Move up
            _buildActionItem(
              icon: Icons.arrow_upward_rounded,
              label: 'Move up',
              onTap: () {
                PersonalizationEngine().recordFeedback(card.id, FeedbackEventType.cardReorder);
                Navigator.pop(context);
                onPinChanged?.call();
              },
            ),

            // 3. Move down
            _buildActionItem(
              icon: Icons.arrow_downward_rounded,
              label: 'Move down',
              onTap: () {
                PersonalizationEngine().recordFeedback(card.id, FeedbackEventType.cardReorder);
                Navigator.pop(context);
                onPinChanged?.call();
              },
            ),

            // 4. Hide this card
            _buildActionItem(
              icon: Icons.visibility_off_outlined,
              label: 'Hide this card',
              onTap: () {
                PersonalizationEngine().recordFeedback(card.id, FeedbackEventType.cardHide);
                Navigator.pop(context);
                onCardHidden?.call();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('"${card.title}" hidden from homepage'),
                    duration: const Duration(seconds: 2),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),

            // 5. Why am I seeing this?
            _buildActionItem(
              icon: Icons.info_outline_rounded,
              label: 'Why am I seeing this?',
              onTap: () {
                Navigator.pop(context);
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => WhyThisCardScreen(card: card),
                  ),
                );
              },
            ),

            // 6. Report issue (Red alert text)
            _buildActionItem(
              icon: Icons.flag_outlined,
              label: 'Report issue',
              textColor: AppColors.severeRed,
              iconColor: AppColors.severeRed,
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Issue reported to IMD Technical Team'),
                    duration: Duration(seconds: 2),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),

            const SizedBox(height: 12),

            // Cancel Button Pill
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.surfaceSubtle,
                  foregroundColor: AppColors.navyPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                child: Text(
                  'Cancel',
                  style: AppTypography.button.copyWith(
                    color: AppColors.navyPrimary,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color textColor = AppColors.textPrimary,
    Color iconColor = AppColors.navyPrimary,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 8),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 14),
            Text(
              label,
              style: AppTypography.bodyLarge.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
