import SwiftUI

/// First-run intro. Opens with a hard brand statement, then frames the loop.
/// High-stakes and adult — no mascots, no "learn English faster" framing.
struct OnboardingView: View {
    /// Called when the learner taps through the final page.
    let onFinish: () -> Void

    @State private var page = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            kind: .brand,
            eyebrow: "Pressure Loop",
            title: "Real-world English,\nunder stress.",
            body: "As if is high-stakes conversation practice for intermediate and advanced speakers — built for the rooms where freezing isn't an option.",
            symbol: "waveform.path.ecg"
        ),
        OnboardingPage(
            kind: .standard,
            eyebrow: "How it works",
            title: "Enter the room.\nHold your answer.\nRespond under pressure.",
            body: "Pick a scenario, face the questions out loud, then read a sharp debrief on how you held up. Run it again until it's automatic.",
            symbol: "arrow.triangle.2.circlepath"
        ),
        OnboardingPage(
            kind: .standard,
            eyebrow: "No safety net",
            title: "Survive the\nconversation.",
            body: "Fast questions, follow-ups, and traps — so the real border desk, traffic stop, or witness stand feels like something you've already done.",
            symbol: "bolt.shield"
        )
    ]

    var body: some View {
        ZStack {
            ScreenBackground()

            VStack(spacing: 0) {
                TabView(selection: $page) {
                    ForEach(Array(pages.enumerated()), id: \.offset) { index, item in
                        OnboardingPageView(page: item)
                            .tag(index)
                            .padding(.horizontal, Theme.Layout.screenPadding)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: page)

                controls
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.bottom, 12)
            }
        }
    }

    private var isLast: Bool { page == pages.count - 1 }

    private var controls: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Page indicator
            HStack(spacing: 8) {
                ForEach(pages.indices, id: \.self) { index in
                    Capsule()
                        .fill(index == page ? Theme.Color.accent : Theme.Color.stroke)
                        .frame(width: index == page ? 24 : 7, height: 7)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: page)
                }
            }

            Button(isLast ? "Enter the Pressure Loop" : "Continue") {
                if isLast {
                    onFinish()
                } else {
                    withAnimation { page += 1 }
                }
            }
            .buttonStyle(PrimaryButtonStyle())

            Button("Skip briefing", action: onFinish)
                .font(Theme.Font.caption())
                .foregroundStyle(Theme.Color.textTertiary)
                .opacity(isLast ? 0 : 1)
                .disabled(isLast)
        }
    }
}

private struct OnboardingPage {
    enum Kind { case brand, standard }
    let kind: Kind
    let eyebrow: String
    let title: String
    let body: String
    let symbol: String
}

private struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
            Spacer(minLength: 0)

            if page.kind == .brand {
                // Hard brand statement.
                VStack(alignment: .leading, spacing: 6) {
                    Text("AS IF")
                        .font(.system(size: 64, weight: .heavy, design: .default))
                        .tracking(2)
                        .foregroundStyle(Theme.Color.textPrimary)
                    Rectangle()
                        .fill(Theme.Gradient.accent)
                        .frame(width: 64, height: 4)
                        .clipShape(Capsule())
                }
            } else {
                Image(systemName: page.symbol)
                    .font(.system(size: 50, weight: .regular))
                    .foregroundStyle(Theme.Color.accent)
                    .frame(width: 96, height: 96)
                    .background(
                        RoundedRectangle(cornerRadius: 28, style: .continuous)
                            .fill(Theme.Color.accentSoft)
                    )
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                PillLabel(text: page.eyebrow)

                Text(page.title)
                    .font(Theme.Font.display(33))
                    .foregroundStyle(Theme.Color.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineSpacing(2)

                Text(page.body)
                    .font(Theme.Font.body(17))
                    .foregroundStyle(Theme.Color.textSecondary)
                    .lineSpacing(5)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    OnboardingView(onFinish: {})
}
