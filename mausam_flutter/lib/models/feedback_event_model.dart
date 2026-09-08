enum FeedbackEventType {
  cardView,
  cardClick,
  cardExpand,
  cardPin,
  cardUnpin,
  cardReorder,
  cardHide,
  cardUnhide,
  cardFeedbackPositive,
  cardFeedbackNegative,
}

class FeedbackEvent {
  final String cardId;
  final FeedbackEventType eventType;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  FeedbackEvent({
    required this.cardId,
    required this.eventType,
    DateTime? timestamp,
    this.metadata,
  }) : timestamp = timestamp ?? DateTime.now();
}
