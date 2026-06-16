import SwiftUI

/// The debrief shown after a session. Scores and copy are generated locally and
/// deterministically — a stand-in for real evaluation that demonstrates the
/// payoff at the end of the loop.
struct ResultView: View {
    let scenario: Scenario
    let feedback: PracticeFeedback
    /// Called to dismiss the result and return to the scenario.
    let onDone: () -> Void

    @State private var animateScore = false

    var body: some View {
        ZStack {
            ScreenBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                    scoreHeader
                    summaryCard
                    metricsSection
                    listSection(title: "What held", tint: Theme.Color.success,
                                symbol: "checkmark.circle.fill", items: feedback.strengths)
                    listSection(title: "What to sharpen", tint: Theme.Color.warning,
                                symbol: "arrow.up.right.circle.fill", items: feedback.improvements)
                    suggestedLineCard
                    disclaimer
                }
                .padding(.horizontal, Theme.Layout.screenPadding)
                .padding(.top, Theme.Spacing.lg)
                .padding(.bottom, 130)
            }

            bottomBar
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.8).delay(0.1)) {
                animateScore = true
            }
        }
    }

    // MARK: - Sections

    private var scoreHeader: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
            HStack {
                PillLabel(text: "Debrief")
                Spacer()
                Text(scenario.title)
                    .font(Theme.Font.caption(13))
                    .foregroundStyle(Theme.Color.textTertiary)
            }
            .padding(.top, 8)

            HStack(alignment: .center, spacing: 22) {
                ZStack {
                    Circle()
                        .stroke(Theme.Color.surface, lineWidth: 11)
                    Circle()
                        .trim(from: 0, to: animateScore ? CGFloat(feedback.overallScore) / 100 : 0)
                        .stroke(Theme.Gradient.accent, style: StrokeStyle(lineWidth: 11, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    VStack(spacing: 0) {
                        Text("\(feedback.overallScore)")
                            .font(Theme.Font.display(36))
                            .foregroundStyle(Theme.Color.textPrimary)
                            .contentTransition(.numericText())
                        Text("/ 100")
                            .font(Theme.Font.caption(11))
                            .foregroundStyle(Theme.Color.textTertiary)
                    }
                }
                .frame(width: 124, height: 124)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Grade \(feedback.grade)")
                        .font(Theme.Font.mono(13))
                        .tracking(1.0)
                        .foregroundStyle(Theme.Color.accent)
                    Text(feedback.headline)
                        .font(Theme.Font.title(22))
                        .foregroundStyle(Theme.Color.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineSpacing(2)
                }
            }
        }
    }

    private var summaryCard: some View {
        Text(feedback.summary)
            .font(Theme.Font.body(16))
            .foregroundStyle(Theme.Color.textSecondary)
            .lineSpacing(4)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardSurface()
    }

    private var metricsSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            SectionEyebrow(text: "Response quality")

            VStack(spacing: 18) {
                ForEach(feedback.metrics) { metric in
                    MetricBar(metric: metric, animate: animateScore)
                }
            }
            .cardSurface()
        }
    }

    private func listSection(title: String, tint: Color, symbol: String, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            SectionEyebrow(text: title)

            VStack(spacing: Theme.Spacing.sm) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: symbol)
                            .font(.system(size: 15))
                            .foregroundStyle(tint)
                        Text(item)
                            .font(Theme.Font.body(15))
                            .foregroundStyle(Theme.Color.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineSpacing(2)
                        Spacer(minLength: 0)
                    }
                }
            }
            .cardSurface()
        }
    }

    private var suggestedLineCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(spacing: 8) {
                Image(systemName: "quote.opening")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.Color.accent)
                SectionEyebrow(text: "A sharper answer", tint: Theme.Color.accent)
            }
            Text(feedback.suggestedLine)
                .font(Theme.Font.title(19))
                .foregroundStyle(Theme.Color.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
                .lineSpacing(3)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .fill(Theme.Color.accentSoft)
        )
        .overlay(alignment: .leading) {
            RoundedRectangle(cornerRadius: 2, style: .continuous)
                .fill(Theme.Gradient.accent)
                .frame(width: 3)
                .padding(.vertical, 20)
        }
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .stroke(Theme.Color.accent.opacity(0.3), lineWidth: 1)
        )
    }

    private var disclaimer: some View {
        Text("Sample debrief for this prototype. Scoring and coaching are generated on-device and don't yet analyze your actual speech.")
            .font(Theme.Font.caption(12))
            .foregroundStyle(Theme.Color.textTertiary)
            .fixedSize(horizontal: false, vertical: true)
            .lineSpacing(2)
    }

    // MARK: - Bottom bar

    private var bottomBar: some View {
        VStack {
            Spacer()
            VStack(spacing: 0) {
                LinearGradient(
                    colors: [Theme.Color.background.opacity(0), Theme.Color.background],
                    startPoint: .top, endPoint: .bottom
                )
                .frame(height: 28)

                Button("Finish debrief", action: onDone)
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.bottom, 12)
                    .background(Theme.Color.background)
            }
        }
        .ignoresSafeArea(edges: .bottom)
    }
}

// MARK: - Metric bar

private struct MetricBar: View {
    let metric: PracticeFeedback.Metric
    let animate: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(metric.name)
                    .font(Theme.Font.body(15))
                    .foregroundStyle(Theme.Color.textPrimary)
                Spacer()
                Text("\(metric.value)")
                    .font(Theme.Font.mono(14))
                    .foregroundStyle(Theme.Color.textSecondary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.Color.surfaceElevated)
                    Capsule()
                        .fill(Theme.Gradient.accent)
                        .frame(width: animate ? geo.size.width * CGFloat(metric.value) / 100 : 0)
                        .animation(.spring(response: 0.8, dampingFraction: 0.85), value: animate)
                }
            }
            .frame(height: 7)
        }
    }
}

#Preview {
    ResultView(
        scenario: ScenarioData.courtroom,
        feedback: MockFeedbackEngine.evaluate(
            scenario: ScenarioData.courtroom,
            session: PracticeSession(scenarioID: ScenarioData.courtroom.id)
        ),
        onDone: {}
    )
}
