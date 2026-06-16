import SwiftUI

/// First-run intro. Sets the high-stakes tone and explains the loop without
/// any mascots or cute education tropes.
struct OnboardingView: View {
    /// Called when the learner taps through the final page.
    let onFinish: () -> Void

    @State private var page = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            eyebrow: "As if",
            title: "Practice the conversations\nthat actually scare you.",
            body: "Immigration desks. Police stops. ER intake. Cross-examination. The moments where your English has to hold up under real pressure.",
            symbol: "waveform.path.ecg"
        ),
        OnboardingPage(
            eyebrow: "The pressure loop",
            title: "Speak. Be judged.\nSharpen. Repeat.",
            body: "Pick a scenario, face the questions out loud, and get a direct read on how you held up — then run it again until it's automatic.",
            symbol: "arrow.triangle.2.circlepath"
        ),
        OnboardingPage(
            eyebrow: "No safety net",
            title: "It feels real\nbecause it's meant to.",
            body: "Fast questions, follow-ups, and traps — so the real thing feels like something you've already done.",
            symbol: "bolt.shield"
        )
    ]

    var body: some View {
        ZStack {
            Theme.Color.background.ignoresSafeArea()

            // Subtle accent glow anchored to the top.
            RadialGradient(
                colors: [Theme.Color.accent.opacity(0.22), .clear],
                center: .top,
                startRadius: 0,
                endRadius: 420
            )
            .ignoresSafeArea()

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

    private var controls: some View {
        VStack(spacing: 20) {
            // Page indicator
            HStack(spacing: 8) {
                ForEach(pages.indices, id: \.self) { index in
                    Capsule()
                        .fill(index == page ? Theme.Color.accent : Theme.Color.stroke)
                        .frame(width: index == page ? 22 : 7, height: 7)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: page)
                }
            }

            Button(page == pages.count - 1 ? "Start practicing" : "Continue") {
                if page == pages.count - 1 {
                    onFinish()
                } else {
                    withAnimation { page += 1 }
                }
            }
            .buttonStyle(PrimaryButtonStyle())

            Button("Skip intro", action: onFinish)
                .font(Theme.Font.caption())
                .foregroundStyle(Theme.Color.textTertiary)
                .opacity(page == pages.count - 1 ? 0 : 1)
        }
    }
}

private struct OnboardingPage {
    let eyebrow: String
    let title: String
    let body: String
    let symbol: String
}

private struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(alignment: .leading, spacing: 28) {
            Spacer(minLength: 0)

            Image(systemName: page.symbol)
                .font(.system(size: 52, weight: .regular))
                .foregroundStyle(Theme.Color.accent)
                .frame(width: 96, height: 96)
                .background(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(Theme.Color.accentSoft)
                )

            VStack(alignment: .leading, spacing: 16) {
                PillLabel(text: page.eyebrow)

                Text(page.title)
                    .font(Theme.Font.display(32))
                    .foregroundStyle(Theme.Color.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineSpacing(2)

                Text(page.body)
                    .font(Theme.Font.body(17))
                    .foregroundStyle(Theme.Color.textSecondary)
                    .lineSpacing(4)
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
