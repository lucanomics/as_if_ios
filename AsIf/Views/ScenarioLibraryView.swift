import SwiftUI

/// The home screen — a training deck of high-stakes scenarios. Framed as a
/// mission board, not a lesson list.
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
                ScreenBackground()

                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        header
                        categoryFilter
                        deckHeading
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
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
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

            Text("Five rooms where your English has to perform. Step into one and respond under pressure.")
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

    private var deckHeading: some View {
        HStack {
            SectionEyebrow(text: "Training deck")
            Spacer()
            Text("\(filtered.count) \(filtered.count == 1 ? "room" : "rooms")")
                .font(Theme.Font.mono(11))
                .tracking(1.2)
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .padding(.top, 4)
    }

    private var scenarioList: some View {
        LazyVStack(spacing: Theme.Spacing.md) {
            ForEach(Array(filtered.enumerated()), id: \.element.id) { index, scenario in
                NavigationLink(value: scenario) {
                    ScenarioCard(scenario: scenario, index: index + 1)
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
    let index: Int

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: scenario.symbol)
                    .font(.system(size: 22, weight: .medium))
                    .foregroundStyle(Theme.Color.accent)
                    .frame(width: 50, height: 50)
                    .background(
                        RoundedRectangle(cornerRadius: 15, style: .continuous)
                            .fill(Theme.Color.accentSoft)
                    )

                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(String(format: "%02d", index))
                            .font(Theme.Font.mono(11))
                            .foregroundStyle(Theme.Color.accent)
                        Text("·")
                            .foregroundStyle(Theme.Color.textTertiary)
                        Text(scenario.category.rawValue.uppercased())
                            .font(Theme.Font.mono(11))
                            .tracking(1.2)
                            .foregroundStyle(Theme.Color.textTertiary)
                    }
                    Text(scenario.title)
                        .font(Theme.Font.title(21))
                        .foregroundStyle(Theme.Color.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: 6) {
                    PressureBars(difficulty: scenario.difficulty)
                    Text(scenario.difficulty.label.uppercased())
                        .font(Theme.Font.mono(9))
                        .tracking(0.8)
                        .foregroundStyle(scenario.difficulty.tint)
                }
            }

            Text(scenario.tagline)
                .font(Theme.Font.body(15))
                .foregroundStyle(Theme.Color.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineSpacing(2)

            Rectangle()
                .fill(Theme.Color.stroke)
                .frame(height: 1)

            HStack(spacing: 14) {
                Label("\(scenario.estimatedMinutes) min", systemImage: "clock")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                Label("\(scenario.prompts.count) rounds", systemImage: "arrow.triangle.2.circlepath")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                Spacer()
                Text("Enter")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.accent)
                Image(systemName: "arrow.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Theme.Color.accent)
            }
        }
        .cardSurface()
    }
}

#Preview {
    ScenarioLibraryView()
}
