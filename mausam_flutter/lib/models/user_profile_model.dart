class UserProfileModel {
  final String id;
  final String name;
  final String email;
  final String location;
  final Set<String> selectedInterests;
  final List<String> pinnedCardIds;
  final List<String> hiddenCardIds;
  final String learningInsight;

  UserProfileModel({
    required this.id,
    required this.name,
    required this.email,
    required this.location,
    required this.selectedInterests,
    this.pinnedCardIds = const [],
    this.hiddenCardIds = const [],
    this.learningInsight = 'Mausam is learning for you. The more you use Mausam, the better it gets at showing what matters.',
  });

  UserProfileModel copyWith({
    String? id,
    String? name,
    String? email,
    String? location,
    Set<String>? selectedInterests,
    List<String>? pinnedCardIds,
    List<String>? hiddenCardIds,
    String? learningInsight,
  }) {
    return UserProfileModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      location: location ?? this.location,
      selectedInterests: selectedInterests ?? this.selectedInterests,
      pinnedCardIds: pinnedCardIds ?? this.pinnedCardIds,
      hiddenCardIds: hiddenCardIds ?? this.hiddenCardIds,
      learningInsight: learningInsight ?? this.learningInsight,
    );
  }
}
