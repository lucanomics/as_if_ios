import SwiftUI

/// Briefing screen for a single scenario. Frames the stakes and the objective,
/// then launches the practice session — the "before you enter the room" beat.
struct ScenarioDetailView: View {
    let scenario: Scenario

    @State private var showPractice = false

    var body: some View {
        ZStack {
            ScreenBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                    hero
                    objectiveCard
                    situationSection
                    pressureSection
                    firstContactSection
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
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            PillLabel(text: "Briefing")

            Image(systemName: scenario.symbol)
                .font(.system(size: 32, weight: .medium))
                .foregroundStyle(Theme.Color.accent)
                .frame(width: 72, height: 72)
                .background(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(Theme.Color.accentSoft)
                )
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 8) {
                SectionEyebrow(text: scenario.category.rawValue)
                Text(scenario.title)
                    .font(Theme.Font.display(32))
                    .foregroundStyle(Theme.Color.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: 16) {
                HStack(spacing: 8) {
                    PressureBars(difficulty: scenario.difficulty)
                    Text(scenario.difficulty.label)
                        .font(Theme.Font.caption(13))
                        .foregroundStyle(Theme.Color.textSecondary)
                }
                Label("\(scenario.estimatedMinutes) min", systemImage: "clock")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                Label("\(scenario.prompts.count) rounds", systemImage: "arrow.triangle.2.circlepath")
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
            }
        }
        .padding(.top, 8)
    }

    private var objectiveCard: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: "target")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(Theme.Color.accent)
            VStack(alignment: .leading, spacing: 6) {
                SectionEyebrow(text: "Your objective")
                Text(objective)
                    .font(Theme.Font.body(16))
                    .foregroundStyle(Theme.Color.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineSpacing(3)
            }
            Spacer(minLength: 0)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .fill(Theme.Color.accentSoft)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .stroke(Theme.Color.accent.opacity(0.28), lineWidth: 1)
        )
    }

    private var situationSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            SectionEyebrow(text: "The situation")
            Text(scenario.summary)
                .font(Theme.Font.body(17))
                .foregroundStyle(Theme.Color.textSecondary)
                .lineSpacing(5)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var pressureSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            SectionEyebrow(text: "What you're judged on")

            VStack(spacing: Theme.Spacing.sm) {
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

    private var firstContactSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            SectionEyebrow(text: "First contact")

            if let first = scenario.prompts.first {
                VStack(alignment: .leading, spacing: 10) {
                    Text(officialRole.uppercased())
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

    // MARK: - Derived copy

    private var officialRole: String {
        switch scenario.category {
        case .immigration: return "Immigration Officer"
        case .law: return "Police Officer"
        case .medical: return "Triage Nurse"
        case .court: return "Prosecutor"
        case .everyday: return "Local"
        }
    }

    private var objective: String {
        switch scenario.category {
        case .immigration:
            return "Get through inspection: answer clearly, stay consistent, and don't unravel under repeated questions."
        case .law:
            return "Keep it calm and controlled: comply, stay clear, and give the officer no reason to escalate."
        case .medical:
            return "Be understood fast: describe what's wrong with precise timing and intensity so you're triaged correctly."
        case .court:
            return "Hold your ground: answer only what's asked, truthfully, without letting the questioning reshape your words."
        case .everyday:
            return "Keep up and keep it flowing: react naturally, ask for a repeat when you need it, and don't freeze."
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

                Button("Enter the room") { showPractice = true }
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
