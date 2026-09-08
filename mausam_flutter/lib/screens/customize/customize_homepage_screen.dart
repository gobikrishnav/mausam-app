import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/weather_card_model.dart';
import '../../models/feedback_event_model.dart';
import '../../services/personalization_engine.dart';

class CustomizeHomepageScreen extends StatefulWidget {
  const CustomizeHomepageScreen({super.key});

  @override
  State<CustomizeHomepageScreen> createState() => _CustomizeHomepageScreenState();
}

class _CustomizeHomepageScreenState extends State<CustomizeHomepageScreen> {
  int _selectedTab = 0; // 0: My Cards, 1: All Cards
  late List<WeatherCardModel> _myCards;
  late List<WeatherCardModel> _allCards;

  @override
  void initState() {
    super.initState();
    _loadCards();
  }

  void _loadCards() {
    final engine = PersonalizationEngine();
    _myCards = engine.getRankedHomepageCards();
    _allCards = engine.getInitialCards();
  }

  void _onReorder(int oldIndex, int newIndex) {
    setState(() {
      if (oldIndex < newIndex) {
        newIndex -= 1;
      }
      final item = _myCards.removeAt(oldIndex);
      _myCards.insert(newIndex, item);
    });
  }

  void _togglePin(WeatherCardModel card) {
    setState(() {
      card.isPinned = !card.isPinned;
    });

    PersonalizationEngine().recordFeedback(
      card.id,
      card.isPinned ? FeedbackEventType.cardPin : FeedbackEventType.cardUnpin,
    );
  }

  void _removeCard(WeatherCardModel card) {
    setState(() {
      _myCards.removeWhere((c) => c.id == card.id);
    });
    PersonalizationEngine().recordFeedback(
      card.id,
      FeedbackEventType.cardHide,
    );
  }

  void _addCard(WeatherCardModel card) {
    setState(() {
      PersonalizationEngine().currentUser.hiddenCardIds.remove(card.id);
      if (!_myCards.any((c) => c.id == card.id)) {
        _myCards.add(card);
      }
    });
    PersonalizationEngine().recordFeedback(
      card.id,
      FeedbackEventType.cardUnhide,
    );
  }

  void _saveChanges() {
    final engine = PersonalizationEngine();
    // Save order of pinned cards
    final pinnedIds = _myCards.where((c) => c.isPinned).map((c) => c.id).toList();
    engine.updatePinnedOrder(pinnedIds);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Homepage layout updated successfully',
          style: AppTypography.bodySmall.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.navyPrimary,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );

    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: AppColors.navyPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Customize Homepage',
          style: AppTypography.h3.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.navyPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),

            // Tab Pill Selector [ My Cards | All Cards ]
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedTab == 0 ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: _selectedTab == 0
                                ? const [
                                    BoxShadow(
                                      color: Color(0x0F000000),
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              'My Cards (${_myCards.length})',
                              style: AppTypography.buttonSmall.copyWith(
                                color: _selectedTab == 0
                                    ? AppColors.navyPrimary
                                    : AppColors.textMuted,
                                fontWeight: _selectedTab == 0
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 1),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedTab == 1 ? Colors.white : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: _selectedTab == 1
                                ? const [
                                    BoxShadow(
                                      color: Color(0x0F000000),
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              'All Cards (${_allCards.length})',
                              style: AppTypography.buttonSmall.copyWith(
                                color: _selectedTab == 1
                                    ? AppColors.navyPrimary
                                    : AppColors.textMuted,
                                fontWeight: _selectedTab == 1
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Instruction subtitle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  _selectedTab == 0
                      ? 'Hold and drag handle to reorder cards on your homepage'
                      : 'Browse and add specialized IMD weather cards',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Cards List
            Expanded(
              child: _selectedTab == 0 ? _buildMyCardsList() : _buildAllCardsList(),
            ),

            // Bottom Action Bar
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_selectedTab == 0) ...[
                    OutlinedButton.icon(
                      onPressed: () => setState(() => _selectedTab = 1),
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Add More Cards'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.navyPrimary,
                        side: const BorderSide(color: AppColors.cardBorder, width: 1.5),
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  ElevatedButton(
                    onPressed: _saveChanges,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navyPrimary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Save Changes',
                      style: AppTypography.buttonMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyCardsList() {
    return Theme(
      data: Theme.of(context).copyWith(
        canvasColor: Colors.transparent,
        shadowColor: Colors.transparent,
      ),
      child: ReorderableListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _myCards.length,
        onReorder: _onReorder,
        itemBuilder: (context, index) {
          final card = _myCards[index];
          return Container(
            key: ValueKey(card.id),
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: card.isPinned ? AppColors.navyPrimary.withOpacity(0.3) : AppColors.cardBorder,
                width: card.isPinned ? 1.5 : 1.0,
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x06000000),
                  blurRadius: 6,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // 6-dot drag handle
                const Icon(
                  Icons.drag_indicator_rounded,
                  color: AppColors.textMuted,
                  size: 20,
                ),
                const SizedBox(width: 12),

                // Card category icon
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _getCategoryColor(card.category).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    _getCategoryIcon(card.category),
                    size: 20,
                    color: _getCategoryColor(card.category),
                  ),
                ),
                const SizedBox(width: 12),

                // Card title & category badge
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        card.title,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.navyPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              card.category,
                              style: AppTypography.caption.copyWith(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                          if (card.isPinned) ...[
                            const SizedBox(width: 6),
                            Text(
                              'Pinned',
                              style: AppTypography.caption.copyWith(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.navyPrimary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),

                // Pin toggle button
                IconButton(
                  onPressed: () => _togglePin(card),
                  tooltip: card.isPinned ? 'Unpin card' : 'Pin card',
                  icon: Icon(
                    card.isPinned ? Icons.push_pin_rounded : Icons.push_pin_outlined,
                    color: card.isPinned ? AppColors.navyPrimary : AppColors.textMuted,
                    size: 20,
                  ),
                ),

                // Delete / Remove button
                IconButton(
                  onPressed: () => _removeCard(card),
                  tooltip: 'Hide card',
                  icon: const Icon(
                    Icons.close_rounded,
                    color: AppColors.textMuted,
                    size: 18,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildAllCardsList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: _allCards.length,
      itemBuilder: (context, index) {
        final card = _allCards[index];
        final isAdded = _myCards.any((c) => c.id == card.id);

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: _getCategoryColor(card.category).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _getCategoryIcon(card.category),
                  size: 20,
                  color: _getCategoryColor(card.category),
                ),
              ),
              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      card.title,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.navyPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      card.subtitle,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),

              isAdded
                  ? TextButton.icon(
                      onPressed: () => _removeCard(card),
                      icon: const Icon(Icons.check_rounded, size: 16, color: AppColors.successGreen),
                      label: Text(
                        'Added',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.successGreen,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed: () => _addCard(card),
                      icon: const Icon(Icons.add_rounded, size: 16),
                      label: const Text('Add'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.navyPrimary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                    ),
            ],
          ),
        );
      },
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Fitness':
        return Icons.directions_run_rounded;
      case 'Health':
        return Icons.eco_rounded;
      case 'Travel':
        return Icons.directions_car_rounded;
      case 'Farming':
        return Icons.grass_rounded;
      case 'Family':
        return Icons.family_restroom_rounded;
      default:
        return Icons.wb_sunny_rounded;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Fitness':
        return const Color(0xFF16A34A);
      case 'Health':
        return const Color(0xFF0D9488);
      case 'Travel':
        return const Color(0xFF2563EB);
      case 'Farming':
        return const Color(0xFFD97706);
      case 'Family':
        return const Color(0xFF9333EA);
      default:
        return AppColors.navyPrimary;
    }
  }
}
