import SwiftUI

/// Central design tokens for the "As if" brand: a premium, dark, high-stakes look
/// built on near-black surfaces, sharp typography, and a single restrained
/// blue-violet accent. The system stays deliberately small — extend it here
/// rather than introducing ad-hoc colors, fonts, or styles in views.
enum Theme {

    // MARK: Color

    enum Color {
        /// App background — the deepest surface.
        static let background = SwiftUI.Color(red: 0.04, green: 0.04, blue: 0.06)
        /// Raised surface for cards and sheets.
        static let surface = SwiftUI.Color(red: 0.08, green: 0.08, blue: 0.11)
        /// Surface used for the pressed / highlighted state.
        static let surfaceElevated = SwiftUI.Color(red: 0.12, green: 0.12, blue: 0.16)
        /// Hairline separators and card strokes.
        static let stroke = SwiftUI.Color.white.opacity(0.08)

        /// The one restrained accent — a confident blue-violet.
        static let accent = SwiftUI.Color(red: 0.44, green: 0.42, blue: 0.96)
        /// Brighter accent edge, used only for gradients/highlights.
        static let accentBright = SwiftUI.Color(red: 0.56, green: 0.48, blue: 1.0)
        static let accentSoft = SwiftUI.Color(red: 0.44, green: 0.42, blue: 0.96).opacity(0.16)

        static let textPrimary = SwiftUI.Color.white
        static let textSecondary = SwiftUI.Color.white.opacity(0.62)
        static let textTertiary = SwiftUI.Color.white.opacity(0.38)

        static let danger = SwiftUI.Color(red: 0.93, green: 0.36, blue: 0.40)
        static let success = SwiftUI.Color(red: 0.36, green: 0.80, blue: 0.58)
        static let warning = SwiftUI.Color(red: 0.95, green: 0.72, blue: 0.36)
    }

    enum Gradient {
        /// Premium accent gradient for primary actions and focal moments.
        static let accent = LinearGradient(
            colors: [Theme.Color.accentBright, Theme.Color.accent],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: Typography

    enum Font {
        static func display(_ size: CGFloat = 34) -> SwiftUI.Font {
            .system(size: size, weight: .bold, design: .default)
        }
        static func title(_ size: CGFloat = 24) -> SwiftUI.Font {
            .system(size: size, weight: .semibold, design: .default)
        }
        static func headline(_ size: CGFloat = 18) -> SwiftUI.Font {
            .system(size: size, weight: .semibold, design: .default)
        }
        static func body(_ size: CGFloat = 16) -> SwiftUI.Font {
            .system(size: size, weight: .regular, design: .default)
        }
        static func caption(_ size: CGFloat = 13) -> SwiftUI.Font {
            .system(size: size, weight: .medium, design: .default)
        }
        /// Uppercase eyebrow / label text.
        static func mono(_ size: CGFloat = 12) -> SwiftUI.Font {
            .system(size: size, weight: .semibold, design: .monospaced)
        }
    }

    // MARK: Layout

    enum Layout {
        static let screenPadding: CGFloat = 24
        static let cardRadius: CGFloat = 22
        static let controlRadius: CGFloat = 14
    }

    /// A small, consistent spacing scale.
    enum Spacing {
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }
}

// MARK: - Reusable backdrop

/// The shared cinematic backdrop: a near-black base with a restrained accent
/// glow anchored to the top. Used across screens for a consistent, immersive
/// foundation instead of re-declaring gradients per view.
struct ScreenBackground: View {
    var glow: Bool = true
    var glowColor: Color = Theme.Color.accent

    var body: some View {
        ZStack {
            Theme.Color.background
            if glow {
                RadialGradient(
                    colors: [glowColor.opacity(0.20), .clear],
                    center: .topLeading,
                    startRadius: 0,
                    endRadius: 460
                )
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - Reusable components

/// An uppercase eyebrow / tag pill used for sections and metadata.
struct PillLabel: View {
    let text: String
    var tint: Color = Theme.Color.accent
    var body: some View {
        Text(text.uppercased())
            .font(Theme.Font.mono(11))
            .tracking(1.6)
            .foregroundStyle(tint)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                Capsule(style: .continuous).fill(tint.opacity(0.14))
            )
    }
}

/// A small uppercase section eyebrow (no pill), for in-content headers.
struct SectionEyebrow: View {
    let text: String
    var tint: Color = Theme.Color.textTertiary
    var body: some View {
        Text(text.uppercased())
            .font(Theme.Font.mono(11))
            .tracking(1.8)
            .foregroundStyle(tint)
    }
}

/// Three ascending bars communicating pressure/difficulty level at a glance —
/// scannable like signal strength, in keeping with the "mission board" feel.
struct PressureBars: View {
    let difficulty: Scenario.Difficulty
    var body: some View {
        HStack(alignment: .bottom, spacing: 3) {
            ForEach(0..<3, id: \.self) { i in
                Capsule(style: .continuous)
                    .fill(i < difficulty.rawValue ? difficulty.tint : Theme.Color.surfaceElevated)
                    .frame(width: 4, height: 7 + CGFloat(i) * 4)
            }
        }
    }
}

// MARK: - Reusable styling

/// A dark card surface with a hairline stroke, used throughout the app.
struct CardSurface: ViewModifier {
    var padding: CGFloat = 20
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                    .fill(Theme.Color.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                    .stroke(Theme.Color.stroke, lineWidth: 1)
            )
    }
}

extension View {
    func cardSurface(padding: CGFloat = 20) -> some View {
        modifier(CardSurface(padding: padding))
    }
}

/// Primary call-to-action button styling — accent gradient with a soft glow.
struct PrimaryButtonStyle: ButtonStyle {
    var enabled: Bool = true
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Font.headline())
            .tracking(0.3)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(
                RoundedRectangle(cornerRadius: Theme.Layout.controlRadius, style: .continuous)
                    .fill(Theme.Color.surfaceElevated)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Layout.controlRadius, style: .continuous)
                            .fill(Theme.Gradient.accent)
                            .opacity(enabled ? 1 : 0)
                    )
            )
            .foregroundStyle(enabled ? .white : Theme.Color.textTertiary)
            .shadow(color: Theme.Color.accent.opacity(enabled ? 0.35 : 0),
                    radius: configuration.isPressed ? 8 : 16, y: 6)
            .opacity(configuration.isPressed ? 0.9 : 1)
            .scaleEffect(configuration.isPressed ? 0.985 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

/// Secondary button — outlined, low-emphasis.
struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Font.headline())
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(
                RoundedRectangle(cornerRadius: Theme.Layout.controlRadius, style: .continuous)
                    .fill(Theme.Color.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Layout.controlRadius, style: .continuous)
                    .stroke(Theme.Color.stroke, lineWidth: 1)
            )
            .foregroundStyle(Theme.Color.textPrimary)
            .opacity(configuration.isPressed ? 0.7 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}
