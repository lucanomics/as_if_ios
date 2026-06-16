import SwiftUI

/// The home screen — a library of high-stakes scenarios to practice.
struct ScenarioLibraryView: View {
    @State private var selectedCategory: Scenario.Category?

    private let scenarios = ScenarioData.all

    private var filtered: [Scenario] {
        guard let selectedCategory else { return scenarios }
        return scenarios.filter { $0.category == selectedCategory }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Color.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header
                        categoryFilter
                        scenarioList
                    }
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.bottom, 40)
                }
            }
            .navigationDestination(for: Scenario.self) { scenario in
                ScenarioDetailView(scenario: scenario)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    // MARK: - Sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                PillLabel(text: "Pressure Loop")
                Spacer()
                Text("As if")
                    .font(Theme.Font.headline(17))
                    .foregroundStyle(Theme.Color.textPrimary)
            }
            .padding(.top, 12)

            Text("Choose your\npressure.")
                .font(Theme.Font.display(36))
                .foregroundStyle(Theme.Color.textPrimary)
                .lineSpacing(2)
                .padding(.top, 4)

            Text("Five situations where your English has to perform. Pick one and step into it.")
                .font(Theme.Font.body(16))
                .foregroundStyle(Theme.Color.textSecondary)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                FilterChip(title: "All", isSelected: selectedCategory == nil) {
                    withAnimation(.easeOut(duration: 0.2)) { selectedCategory = nil }
                }
                ForEach(Scenario.Category.allCases, id: \.self) { category in
                    FilterChip(title: category.rawValue, isSelected: selectedCategory == category) {
                        withAnimation(.easeOut(duration: 0.2)) { selectedCategory = category }
                    }
                }
            }
            .padding(.vertical, 2)
        }
    }

    private var scenarioList: some View {
        LazyVStack(spacing: 16) {
            ForEach(filtered) { scenario in
                NavigationLink(value: scenario) {
                    ScenarioCard(scenario: scenario)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Filter chip

private struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Font.caption(14))
                .foregroundStyle(isSelected ? .white : Theme.Color.textSecondary)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    Capsule(style: .continuous)
                        .fill(isSelected ? Theme.Color.accent : Theme.Color.surface)
                )
                .overlay(
                    Capsule(style: .continuous)
                        .stroke(isSelected ? .clear : Theme.Color.stroke, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Scenario card

private struct ScenarioCard: View {
    let scenario: Scenario

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 16) {
                Image(systemName: scenario.symbol)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(Theme.Color.accent)
                    .frame(width: 54, height: 54)
                    .background(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(Theme.Color.accentSoft)
                    )

                VStack(alignment: .leading, spacing: 6) {
                    Text(scenario.category.rawValue.uppercased())
                        .font(Theme.Font.mono(11))
                        .tracking(1.2)
                        .foregroundStyle(Theme.Color.textTertiary)
                    Text(scenario.title)
                        .font(Theme.Font.title(21))
                        .foregroundStyle(Theme.Color.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }

            Text(scenario.tagline)
                .font(Theme.Font.body(15))
                .foregroundStyle(Theme.Color.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineSpacing(2)

            HStack(spacing: 14) {
                DifficultyTag(difficulty: scenario.difficulty)
                Label("\(scenario.estimatedMinutes) min", systemImage: "clock")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                Spacer()
                Image(systemName: "arrow.right")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.Color.textSecondary)
            }
        }
        .cardSurface()
    }
}

struct DifficultyTag: View {
    let difficulty: Scenario.Difficulty
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(difficulty.tint)
                .frame(width: 7, height: 7)
            Text(difficulty.label)
                .font(Theme.Font.caption(13))
                .foregroundStyle(Theme.Color.textSecondary)
        }
    }
}

#Preview {
    ScenarioLibraryView()
}
