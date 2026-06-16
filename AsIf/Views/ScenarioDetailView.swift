import SwiftUI

/// Briefing screen for a single scenario. Frames the stakes and launches the
/// practice session.
struct ScenarioDetailView: View {
    let scenario: Scenario

    @State private var showPractice = false

    var body: some View {
        ZStack {
            Theme.Color.background.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    hero
                    summarySection
                    pressureSection
                    previewSection
                    Spacer(minLength: 8)
                }
                .padding(.horizontal, Theme.Layout.screenPadding)
                .padding(.bottom, 120)
            }

            startBar
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.Color.background, for: .navigationBar)
        .fullScreenCover(isPresented: $showPractice) {
            PracticeSessionView(scenario: scenario)
        }
    }

    // MARK: - Sections

    private var hero: some View {
        VStack(alignment: .leading, spacing: 18) {
            Image(systemName: scenario.symbol)
                .font(.system(size: 34, weight: .medium))
                .foregroundStyle(Theme.Color.accent)
                .frame(width: 76, height: 76)
                .background(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Theme.Color.accentSoft)
                )

            VStack(alignment: .leading, spacing: 10) {
                Text(scenario.category.rawValue.uppercased())
                    .font(Theme.Font.mono(12))
                    .tracking(1.4)
                    .foregroundStyle(Theme.Color.textTertiary)

                Text(scenario.title)
                    .font(Theme.Font.display(32))
                    .foregroundStyle(Theme.Color.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: 16) {
                DifficultyTag(difficulty: scenario.difficulty)
                Label("\(scenario.estimatedMinutes) min", systemImage: "clock")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                Label("\(scenario.prompts.count) prompts", systemImage: "text.bubble")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
            }
        }
        .padding(.top, 8)
    }

    private var summarySection: some View {
        Text(scenario.summary)
            .font(Theme.Font.body(17))
            .foregroundStyle(Theme.Color.textSecondary)
            .lineSpacing(5)
            .fixedSize(horizontal: false, vertical: true)
    }

    private var pressureSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("What you're judged on")
                .font(Theme.Font.headline())
                .foregroundStyle(Theme.Color.textPrimary)

            VStack(spacing: 12) {
                ForEach(Array(scenario.pressurePoints.enumerated()), id: \.offset) { index, point in
                    HStack(alignment: .top, spacing: 14) {
                        Text(String(format: "%02d", index + 1))
                            .font(Theme.Font.mono(13))
                            .foregroundStyle(Theme.Color.accent)
                        Text(point)
                            .font(Theme.Font.body(15))
                            .foregroundStyle(Theme.Color.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                }
            }
            .cardSurface()
        }
    }

    private var previewSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("How it opens")
                .font(Theme.Font.headline())
                .foregroundStyle(Theme.Color.textPrimary)

            if let first = scenario.prompts.first {
                VStack(alignment: .leading, spacing: 10) {
                    Text("THEY SAY")
                        .font(Theme.Font.mono(11))
                        .tracking(1.4)
                        .foregroundStyle(Theme.Color.textTertiary)
                    Text("“\(first.text)”")
                        .font(Theme.Font.title(20))
                        .foregroundStyle(Theme.Color.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineSpacing(3)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardSurface()
            }
        }
    }

    // MARK: - Start bar

    private var startBar: some View {
        VStack {
            Spacer()
            VStack(spacing: 0) {
                LinearGradient(
                    colors: [Theme.Color.background.opacity(0), Theme.Color.background],
                    startPoint: .top, endPoint: .bottom
                )
                .frame(height: 28)

                Button("Begin practice") { showPractice = true }
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.bottom, 12)
                    .background(Theme.Color.background)
            }
        }
        .ignoresSafeArea(edges: .bottom)
    }
}

#Preview {
    NavigationStack {
        ScenarioDetailView(scenario: ScenarioData.airportImmigration)
    }
}
